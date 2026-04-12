import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Early Access — RefineX',
  description: 'Full API access, free for 90 days. No credit card required. Built for infrastructure teams who need spot market signal intelligence.',
}

const earlyAccessFeatures = [
  'Full API access — all signal types and endpoints',
  'Confidence-scored spot market signals across all regions',
  'Regime context: STABLE_DISCOUNT, VOLATILE, RECOVERING',
  'Suppression log — public audit trail of every filtered signal',
  'No cloud credentials required — reads public pricing data only',
  'No credit card required to start',
]

const comingTiers = [
  {
    name: 'Starter',
    price: '$149',
    period: '/month',
    usage: '+ $0.10 per signal',
    description: 'Small production workloads',
  },
  {
    name: 'Pro',
    price: '$399',
    period: '/month',
    usage: '+ $0.08 per signal',
    description: 'Production infrastructure teams',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Volume pricing + dedicated support',
  },
]

const faqs = [
  {
    question: 'What happens after 90 days?',
    answer: 'We\'ll reach out before your trial ends. Paid plans start at $149/month. Early access members get first access to pricing and no lock-in.',
  },
  {
    question: 'Do I need cloud credentials?',
    answer: 'No. RefineX reads public AWS pricing data and computes signals server-side. You never share cloud credentials with us.',
  },
  {
    question: 'What counts as a signal?',
    answer: 'A signal is one scored recommendation from /v1/signals, /v1/signals/active, or /v1/signals/summary. Suppressed signals and error responses never count toward usage.',
  },
  {
    question: 'Do you guarantee savings?',
    answer: 'No. Spot pricing can be significantly lower than on-demand, but actual savings depend on your workload, region, instance type, and fallback strategy. RefineX provides recommendations — you control execution.',
  },
  {
    question: 'Is there a free tier after early access ends?',
    answer: 'Yes. A permanent free tier with 10 signals/month will remain available for evaluation and small tests.',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen py-20 px-6" style={{ background: '#0A0F1E' }}>
      <div className="max-w-4xl mx-auto">

        {/* Early Access Banner */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
            Early Access Open
          </span>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-refinex-primary mb-4">
            90 Days Free.<br />Full API Access.
          </h1>
          <p className="text-xl text-refinex-secondary max-w-2xl mx-auto">
            We&apos;re opening early access to infrastructure teams who want spot market signal intelligence
            before committing to a paid plan. No credit card. No usage caps during trial.
          </p>
        </div>

        {/* Early Access Card */}
        <div className="rounded-2xl p-10 mb-16 text-center"
          style={{ background: '#0F172A', border: '1px solid rgba(37,99,235,0.4)' }}>
          <div className="mb-2 text-sm font-semibold uppercase tracking-widest" style={{ color: '#3B82F6' }}>
            Early Access
          </div>
          <div className="text-7xl font-bold text-refinex-primary mb-2">$0</div>
          <div className="text-refinex-secondary mb-8 text-lg">for 90 days · No credit card required</div>

          <ul className="text-left max-w-md mx-auto space-y-3 mb-10">
            {earlyAccessFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <span className="mt-1 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ background: 'rgba(16,185,129,0.2)', color: '#10B981' }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5L3.8 7.5L8.5 2.5" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="text-refinex-secondary">{feature}</span>
              </li>
            ))}
          </ul>

          <Link href="/docs/quickstart"
            className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold text-white text-lg transition-all hover:opacity-90"
            style={{ background: '#2563EB' }}>
            Get API key — free for 90 days
          </Link>
          <p className="text-xs text-refinex-muted mt-4">
            API key issued immediately. No sales call required.
          </p>
        </div>

        {/* Paid Tiers */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-refinex-primary mb-2 text-center">
            Paid Plans
          </h2>
          <p className="text-refinex-secondary text-center mb-8">
            Upgrade when ready. Early access members receive priority pricing.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {comingTiers.map((tier) => (
              <div key={tier.name} className="rounded-xl p-6"
                style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-xl font-bold text-refinex-primary mb-1">{tier.name}</div>
                <div className="text-2xl font-bold mb-1" style={{ color: '#3B82F6' }}>
                  {tier.price}<span className="text-sm font-normal text-refinex-muted">{tier.period}</span>
                </div>
                {tier.usage && (
                  <div className="text-xs text-refinex-muted mb-2">{tier.usage}</div>
                )}
                <p className="text-sm text-refinex-secondary">{tier.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Legal */}
        <div className="rounded-xl p-6 mb-16"
          style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="text-base font-semibold text-refinex-primary mb-3">Legal Notes</h3>
          <div className="space-y-2 text-sm text-refinex-secondary">
            <p><strong className="text-refinex-primary">Savings disclaimer:</strong> Spot market savings vary. RefineX provides recommendations based on public market conditions — you remain responsible for workload placement and reliability design.</p>
            <p><strong className="text-refinex-primary">Service scope:</strong> All pricing excludes your cloud provider costs. RefineX emits advisory signals — you control execution.</p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-refinex-primary mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-xl p-6"
                style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 className="text-base font-semibold text-refinex-primary mb-2">{faq.question}</h3>
                <p className="text-sm text-refinex-secondary">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-refinex-primary mb-4">
            Ready to start?
          </h2>
          <p className="text-refinex-secondary mb-8">
            Get a live API key in minutes. No forms, no sales process.
          </p>
          <Link href="/docs/quickstart"
            className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold text-white transition-all hover:opacity-90"
            style={{ background: '#2563EB' }}>
            Get API access — free for 90 days
          </Link>
        </div>

      </div>
    </div>
  )
}
