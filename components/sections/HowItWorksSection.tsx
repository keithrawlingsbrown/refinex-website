const steps = [
  {
    number: '01',
    title: 'Cloud APIs',
    subtitle: 'AWS, GCP, Azure',
    detail: 'Public spot pricing data updated every 5 minutes',
  },
  {
    number: '02',
    title: 'Detection Engine',
    subtitle: 'RefineX Core',
    detail: 'Finds arbitrage opportunities, scores confidence',
  },
  {
    number: '03',
    title: 'Your System',
    subtitle: 'Kubernetes, CI/CD',
    detail: 'Consumes signals via simple REST API',
  },
]

export default function HowItWorksSection() {
  return (
    <section className="py-20 section-divider">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-refinex-primary mb-4">
            How it works
          </h2>
          <p className="text-lg text-refinex-secondary max-w-2xl mx-auto">
            Simple three-step pipeline from cloud APIs to your infrastructure decisions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              <div className="rounded-xl p-8 text-center h-full"
                style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
                  style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)' }}>
                  <span className="text-lg font-bold" style={{ color: '#3B82F6' }}>
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-refinex-primary mb-2">{step.title}</h3>
                <p className="text-sm mb-2" style={{ color: '#2563EB' }}>{step.subtitle}</p>
                <p className="text-sm text-refinex-muted">{step.detail}</p>
              </div>

              {/* Arrow connector */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-5 -translate-y-1/2 z-10 text-refinex-muted">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex flex-col items-center gap-1 px-6 py-3 rounded-lg"
            style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs text-refinex-muted">Updates every</p>
            <p className="text-2xl font-bold text-refinex-primary">5 minutes</p>
          </div>
        </div>
      </div>
    </section>
  )
}
