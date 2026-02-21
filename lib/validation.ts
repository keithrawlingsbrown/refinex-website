import { z } from 'zod'

// Email validation with proper format and length
const EmailSchema = z
  .string()
  .email('Invalid email format')
  .max(254, 'Email too long')
  .transform(email => email.toLowerCase().trim())

// Sanitized string (no HTML, limited length)
const SafeString = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength, `Maximum ${maxLength} characters allowed`)
    .transform(str => str.replace(/[<>]/g, '')) // Remove < and > to prevent HTML injection

// Enterprise lead schema
export const EnterpriseLeadSchema = z.object({
  companyName: SafeString(100),
  role: SafeString(80),
  email: EmailSchema,
  cloudProviders: SafeString(200), // e.g., "AWS, GCP"
  monthlySpend: SafeString(50), // e.g., "$10k-50k"
  message: SafeString(1000).optional(),
})

export type EnterpriseLead = z.infer<typeof EnterpriseLeadSchema>

// Waitlist schema
export const WaitlistSchema = z.object({
  email: EmailSchema,
  name: SafeString(80).optional(),
  company: SafeString(100).optional(),
  source: z.enum(['homepage', 'pricing', 'docs']).optional(),
})

export type WaitlistEntry = z.infer<typeof WaitlistSchema>

// Support escalation schema
export const SupportSchema = z.object({
  name: SafeString(80),
  email: EmailSchema,
  subject: SafeString(150),
  message: SafeString(2000),
  priority: z.enum(['low', 'normal', 'high']).optional().default('normal'),
})

export type SupportEscalation = z.infer<typeof SupportSchema>

// Admin token validation
export const AdminTokenSchema = z.string().min(32, 'Invalid admin token')

// API key validation (for future use)
export const ApiKeySchema = z.string().regex(/^rx_(test|live)_[a-zA-Z0-9]{32,}$/, 'Invalid API key format')

// Validation helper function
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      return {
        success: false,
        error: firstError.message || 'Validation failed',
      }
    }
    return { success: false, error: 'Invalid input' }
  }
}

// SQL injection prevention patterns to check for
export const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
  /(--|#|\/\*|\*\/)/g,
  /('|"|;|\\)/g,
]

// Check if string contains potential SQL injection
export function containsSQLInjection(input: string): boolean {
  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input))
}

// XSS prevention patterns
export const XSS_PATTERNS = [
  /<script/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // onclick, onload, etc.
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
]

// Check if string contains potential XSS
export function containsXSS(input: string): boolean {
  return XSS_PATTERNS.some(pattern => pattern.test(input))
}

// Sanitize user input for display
export function sanitizeForDisplay(input: string, maxLength: number = 500): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}
