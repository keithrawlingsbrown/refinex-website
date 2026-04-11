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
          src="https://app.termly.io/policy-viewer/policy.html?policyUUID=c29d98a4-9ee8-4e54-a608-242b840c4020"
          title="RefineX Privacy Policy"
          className="w-full rounded-xl border"
          style={{
            minHeight: '80vh',
            height: '6000px',
            border: '1px solid rgba(255,255,255,0.06)',
            background: '#ffffff',
          }}
        />
      </div>
    </main>
  )
}
