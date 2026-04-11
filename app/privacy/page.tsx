import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — RefineX',
  description: 'How RefineX collects, uses, and protects your personal information. GDPR, CCPA, and US state law compliant.',
}

export default function Privacy() {
  return (
    <main className="min-h-screen" style={{ background: '#0A0F1E' }}>
      <div className="max-w-4xl mx-auto px-6 py-24">
        <iframe
          src="/legal/privacy-policy.html"
          title="RefineX Privacy Policy"
          className="w-full rounded-xl border"
          style={{
            minHeight: '80vh',
            height: '4000px',
            border: '1px solid rgba(255,255,255,0.06)',
            background: '#ffffff',
          }}
        />
      </div>
    </main>
  )
}
