import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact — RefineX',
  description: 'Get in touch with RefineX for questions about signal intelligence, API access, enterprise plans, or privacy inquiries.',
  openGraph: {
    title: 'Contact — RefineX',
    description: 'Get in touch with RefineX for questions about signal intelligence, API access, enterprise plans, or privacy inquiries.',
    type: 'website',
    url: 'https://www.refinex.io/contact',
    siteName: 'RefineX',
  },
}

const contactMethods = [
  {
    title: 'General Inquiries',
    description: 'Questions about RefineX, API access, or getting started.',
    email: 'keith@getrefinex.com',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
  },
  {
    title: 'Enterprise',
    description: 'Custom integrations, volume pricing, and dedicated support.',
    href: '/enterprise',
    label: 'Enterprise inquiry form',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>
      </svg>
    ),
  },
  {
    title: 'Privacy Requests',
    description: 'Data access, deletion, or other privacy-related inquiries under GDPR, CCPA, or applicable state laws.',
    email: 'keith@getrefinex.com',
    note: 'Please include "Privacy Request" in the subject line.',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
  },
  {
    title: 'Security',
    description: 'Report a security vulnerability or concern.',
    email: 'keith@getrefinex.com',
    note: 'Please include "Security" in the subject line. We respond to security reports within 24 hours.',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
      </svg>
    ),
  },
]

export default function ContactPage() {
  return (
    <main className="min-h-screen px-6 py-24" style={{ background: '#0A0F1E' }}>
      <div className="max-w-2xl mx-auto">

        <div className="mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">Contact</h1>
          <p className="text-slate-400 text-lg">
            Questions about RefineX, API access, privacy, or security. We respond within one business day.
          </p>
        </div>

        <div className="space-y-6">
          {contactMethods.map((method) => (
            <div
              key={method.title}
              className="rounded-xl p-6"
              style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-400"
                  style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.25)' }}
                >
                  {method.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-white mb-1">{method.title}</h2>
                  <p className="text-slate-400 text-sm mb-3">{method.description}</p>

                  {method.email && (
                    <a
                      href={`mailto:${method.email}`}
                      className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {method.email}
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 17L17 7M17 7H7M17 7V17"/>
                      </svg>
                    </a>
                  )}

                  {method.href && (
                    <Link
                      href={method.href}
                      className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {method.label}
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </Link>
                  )}

                  {method.note && (
                    <p className="text-xs text-slate-500 mt-2">{method.note}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl p-6" style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)' }}>
          <p className="text-sm text-slate-400">
            <span className="text-white font-medium">Mailing address:</span>{' '}
            RefineX, 1500 Market Street, 12th Floor, Philadelphia, PA 19102
          </p>
          <p className="text-xs text-slate-500 mt-2">
            This is a virtual business address. For fastest response, use email.
          </p>
        </div>

      </div>
    </main>
  )
}
