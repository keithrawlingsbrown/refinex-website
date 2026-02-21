import { NextRequest, NextResponse } from 'next/server'
import { EnterpriseLeadSchema, validateInput, containsSQLInjection, containsXSS } from '@/lib/validation'

// Mock database save (replace with your actual DB implementation)
function saveToDatabase(data: any) {
  // In production, use prepared statements:
  // db.prepare("INSERT INTO enterprise_leads (company_name, role, email, cloud_providers, monthly_spend, message) VALUES (?, ?, ?, ?, ?, ?)")
  //   .run(data.companyName, data.role, data.email, data.cloudProviders, data.monthlySpend, data.message || null)
  
  console.log('[ENTERPRISE LEAD]', {
    companyName: data.companyName,
    role: data.role,
    email: data.email,
    cloudProviders: data.cloudProviders,
    monthlySpend: data.monthlySpend,
    timestamp: new Date().toISOString(),
  })
  
  return { success: true, id: Date.now() }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body with size limit
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 10000) {
      return NextResponse.json(
        { error: 'Payload too large' },
        { status: 413 }
      )
    }

    const body = await request.json()

    // Validate input against schema
    const validation = validateInput(EnterpriseLeadSchema, body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const data = validation.data

    // Additional security checks
    const allValues = [
      data.companyName,
      data.role,
      data.email,
      data.cloudProviders,
      data.monthlySpend,
      data.message || '',
    ].join(' ')

    if (containsSQLInjection(allValues)) {
      console.warn('[SECURITY] Potential SQL injection attempt detected', {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        timestamp: new Date().toISOString(),
      })
      return NextResponse.json(
        { error: 'Invalid input detected' },
        { status: 400 }
      )
    }

    if (containsXSS(allValues)) {
      console.warn('[SECURITY] Potential XSS attempt detected', {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        timestamp: new Date().toISOString(),
      })
      return NextResponse.json(
        { error: 'Invalid input detected' },
        { status: 400 }
      )
    }

    // Save to database (using prepared statements internally)
    const result = saveToDatabase(data)

    if (!result.success) {
      // Generic error - don't leak implementation details
      console.error('[ERROR] Failed to save enterprise lead', { error: result })
      return NextResponse.json(
        { error: 'Unable to process request' },
        { status: 500 }
      )
    }

    // Success response
    return NextResponse.json(
      { 
        success: true,
        message: 'Thank you! We\'ll be in touch within 24 hours.',
      },
      { 
        status: 201,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )

  } catch (error) {
    // Log error internally but don't expose details to user
    console.error('[ERROR] Enterprise API error:', error)
    
    return NextResponse.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    )
  }
}

// Block all other methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
