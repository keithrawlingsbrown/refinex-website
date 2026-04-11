import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — RefineX',
  description: 'Terms of Service for RefineX cloud infrastructure signal intelligence platform.',
}

export default function Terms() {
  return (
    <main className="min-h-screen" style={{ background: '#0A0F1E' }}>
      <div className="max-w-4xl mx-auto px-6 py-24">
        <iframe
          src="https://app.termly.io/policy-viewer/policy.html?policyUUID=d0b4fd82-ec1f-454f-9a64-00011ea3b783"
          title="RefineX Terms of Service"
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
