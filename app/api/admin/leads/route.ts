import { NextRequest, NextResponse } from 'next/server'

// Constant-time string comparison to prevent timing attacks
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  
  return result === 0
}

// Verify admin authentication
function verifyAdminAuth(request: NextRequest): boolean {
  const adminToken = process.env.ADMIN_TOKEN
  
  if (!adminToken || adminToken.length < 32) {
    console.error('[SECURITY] ADMIN_TOKEN not set or too short')
    return false
  }

  // Get token from header (NOT from query params or body)
  const providedToken = request.headers.get('X-Admin-Token')
  
  if (!providedToken) {
    return false
  }

  // Use timing-safe comparison
  return timingSafeEqual(providedToken, adminToken)
}

// Mock database query (replace with your actual DB)
function getEnterpriseLeads() {
  // In production:
  // const leads = db.prepare("SELECT * FROM enterprise_leads ORDER BY created_at DESC LIMIT 100").all()
  
  return [
    {
      id: 1,
      companyName: 'Example Corp',
      role: 'CTO',
      email: 'cto@example.com',
      cloudProviders: 'AWS, GCP',
      monthlySpend: '$50k-100k',
      message: 'Interested in enterprise plan',
      created_at: new Date().toISOString(),
    }
  ]
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    if (!verifyAdminAuth(request)) {
      // Log unauthorized access attempt
      console.warn('[SECURITY] Unauthorized admin access attempt', {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString(),
      })

      return NextResponse.json(
        { error: 'Unauthorized' },
        { 
          status: 401,
          headers: {
            'WWW-Authenticate': 'Bearer realm="Admin Area"',
          },
        }
      )
    }

    // Get leads from database
    const leads = getEnterpriseLeads()

    // Sanitize data before sending (remove sensitive info if any)
    const sanitizedLeads = leads.map(lead => ({
      ...lead,
      // Don't send internal IDs, tokens, or raw user agents
    }))

    return NextResponse.json(
      { 
        success: true,
        leads: sanitizedLeads,
        count: sanitizedLeads.length,
      },
      {
        status: 200,
        headers: {
          // Critical: prevent caching of admin data
          'Cache-Control': 'no-store, no-cache, must-revalidate, private',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    )

  } catch (error) {
    // Log error internally but don't expose details
    console.error('[ERROR] Admin API error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Block all other methods
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

// Example usage from curl:
// curl -H "X-Admin-Token: your-secret-token-here" https://yourdomain.com/api/admin/leads
