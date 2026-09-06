import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — RefineX',
  description: 'RefineX is not currently offering public access at any tier. Pricing information will be published when that changes.',
}

export default function PricingPage() {
  return (
    <div className="min-h-screen py-20 px-6" style={{ background: '#0A0F1E' }}>
      <div className="max-w-2xl mx-auto text-center">

        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(148,163,184,0.12)', border: '1px solid rgba(148,163,184,0.3)', color: '#94A3B8' }}>
            Not currently available
          </span>
        </div>

        <h1 className="text-4xl font-bold text-refinex-primary mb-6">
          Pricing
        </h1>

        <p className="text-xl text-refinex-secondary mb-4">
          RefineX is not currently offered publicly, at any tier — including free.
        </p>
        <p className="text-refinex-secondary">
          We&apos;re not accepting sign-ups right now. More information, including pricing,
          will be published here when that changes. Check back later.
        </p>

      </div>
    </div>
  )
}
