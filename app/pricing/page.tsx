import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pricing - RefineX',
  description: 'Simple pricing for infrastructure teams. Start free, upgrade when you need production volume.',
}

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'For evaluation and small tests',
    features: [
      '10 signals/month',
      'Community docs',
      'Standard rate limits',
      'API key authentication',
    ],
    cta: 'Start Free',
    href: '/docs/quickstart',
    highlighted: false,
  },
  {
    name: 'Starter',
    price: '$149',
    period: '/month',
    usage: '+ $0.10 per signal',
    description: 'For small production workloads',
    features: [
      'Base subscription + usage billing',
      'Priority support',
      'Higher rate limits',
      'All Free features',
    ],
    cta: 'Get Started',
    href: '/docs/quickstart',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$399',
    period: '/month',
    usage: '+ $0.08 per signal',
    description: 'For production infrastructure teams',
    features: [
      'Base subscription + usage billing',
      'Higher limits + priority handling',
      'Faster support response targets',
      'All Starter features',
    ],
    cta: 'Upgrade to Pro',
    href: '/docs/quickstart',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large-scale deployments',
    features: [
      'Volume pricing',
      'Dedicated support + onboarding',
      'Optional SLA + security review',
      'Custom limits and controls',
    ],
    cta: 'Talk to Sales',
    href: '/enterprise',
    highlighted: false,
  },
]

const faqs = [
  {
    question: 'How is usage billed?',
    answer: 'Signals are metered by successful API responses. Your system controls retry behavior. Usage is calculated monthly and billed on your subscription anniversary.',
  },
  {
    question: 'What counts as a signal?',
    answer: 'A signal is one successful API response from /v1/signals, /v1/signals/active, or /v1/signals/summary. Rate-limited or error responses do not count toward your quota.',
  },
  {
    question: 'Do you guarantee savings?',
    answer: 'No. Spot pricing can be significantly lower than on-demand, but actual savings depend on your workload, region, instance type, and fallback strategy. RefineX provides recommendations — you control execution and reliability design.',
  },
  {
    question: 'Can I change tiers?',
    answer: 'Yes. Upgrade or downgrade anytime. Changes take effect on your next billing cycle. Unused quota does not roll over.',
  },
  {
    question: 'What if I exceed my quota?',
    answer: "Free tier: API returns 429 (rate limited). Paid tiers: Overage billed at your per-signal rate. We'll notify you before you hit limits.",
  },
  {
    question: 'Do I need cloud credentials?',
    answer: 'No. RefineX reads public pricing data and computes signals. You never share cloud credentials with us.',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen py-20 px-6" style={{ background: '#0A0F1E' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-refinex-primary mb-4">
            Pricing That Scales With Usage
          </h1>
          <p className="text-xl text-refinex-secondary max-w-2xl mx-auto">
            Start free for evaluation. Pay for higher volume and faster support when you ship to production.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className="rounded-xl p-8 flex flex-col relative"
              style={{
                background: '#0F172A',
                border: tier.highlighted
                  ? '2px solid #2563EB'
                  : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ background: '#2563EB' }}>
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-refinex-primary mb-2">
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-refinex-primary">
                    {tier.price}
                  </span>
                  <span className="text-refinex-secondary">{tier.period}</span>
                </div>
                {tier.usage && (
                  <p className="text-sm" style={{ color: '#2563EB' }}>{tier.usage}</p>
                )}
                <p className="text-refinex-secondary text-sm mt-2">
                  {tier.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-refinex-secondary"
                  >
                    <svg className="w-5 h-5 text-refinex-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.href}
                className={`w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold ${
                  tier.highlighted ? 'btn-blue' : 'btn-outline-subtle'
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Legal Disclaimers */}
        <div className="rounded-xl p-6 mb-16"
          style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="text-lg font-semibold text-refinex-primary mb-4">
            Pricing Legal Notes
          </h3>
          <div className="space-y-3 text-sm text-refinex-secondary">
            <p>
              <strong className="text-refinex-primary">Usage billing:</strong> Signals are metered by successful responses. If your system retries, you control retry behavior.
            </p>
            <p>
              <strong className="text-refinex-primary">Savings disclaimer:</strong> Spot market savings vary widely. RefineX provides recommendations based on public market conditions; you remain responsible for workload placement and reliability design.
            </p>
            <p>
              <strong className="text-refinex-primary">Service scope:</strong> All pricing excludes your cloud provider costs. RefineX emits read-only recommendations — you control execution.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-refinex-primary mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-xl p-6"
                style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 className="text-lg font-semibold text-refinex-primary mb-2">
                  {faq.question}
                </h3>
                <p className="text-refinex-secondary">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-refinex-primary mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-refinex-secondary mb-8">
            Start with 10 free signals. No credit card required.
          </p>
          <Link href="/docs/quickstart"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold btn-blue">
            Start Free Now
          </Link>
        </div>
      </div>
    </div>
  )
}
