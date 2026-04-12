import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy — RefineX',
  description: 'How RefineX uses cookies and tracking technologies. Opt-in analytics only.',
}

export default function Cookies() {
  return (
    <main className="min-h-screen" style={{ background: '#0A0F1E' }}>
      <div className="max-w-4xl mx-auto px-6 py-24">
        <iframe
          src="https://app.termly.io/policy-viewer/policy.html?policyUUID=18d8acf9-5308-4c8d-83a1-a1364c7ff37d"
          title="RefineX Cookie Policy"
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
