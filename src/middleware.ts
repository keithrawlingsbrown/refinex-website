import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory rate limiter (use Redis in production for multiple instances)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// Rate limit configuration per endpoint pattern
const RATE_LIMITS = {
  '/api/enterprise': { maxRequests: 5, windowMs: 600000 }, // 5 requests per 10 min
  '/api/waitlist': { maxRequests: 5, windowMs: 600000 },
  '/api/support': { maxRequests: 10, windowMs: 600000 },
  '/api/admin': { maxRequests: 20, windowMs: 60000 }, // 20 per minute for admin
}

function rateLimit(ip: string, endpoint: string): boolean {
  const config = Object.keys(RATE_LIMITS).find(pattern => endpoint.startsWith(pattern))
  if (!config) return true // No rate limit for this endpoint

  const limit = RATE_LIMITS[config as keyof typeof RATE_LIMITS]
  const key = `${ip}:${config}`
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + limit.windowMs })
    return true
  }

  if (record.count >= limit.maxRequests) {
    return false // Rate limited
  }

  record.count++
  return true
}

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 3600000)

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Get client IP (handle various proxy headers)
  const ip = 
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (!rateLimit(ip, request.nextUrl.pathname)) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: 600 
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '600',
          }
        }
      )
    }
  }

  // Security Headers (Applied to all routes)
  
  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js needs unsafe-inline/eval for dev
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ]
  response.headers.set('Content-Security-Policy', cspDirectives.join('; '))

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // XSS Protection (legacy but doesn't hurt)
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Referrer Policy (don't leak URLs to external sites)
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Permissions Policy (disable unnecessary features)
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )

  // HSTS (HTTPS only) - only in production with HTTPS
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  // Prevent caching of API responses (especially admin)
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }

  return response
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (*.svg, *.png, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)',
  ],
}
