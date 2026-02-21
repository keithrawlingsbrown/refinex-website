import { Metadata } from 'next'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Link from 'next/link'
import { Check } from 'lucide-react'

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
    highlighted: true,
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
    highlighted: false,
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
    <div className="min-h-screen bg-gradient-hero py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Pricing That Scales With Usage
          </h1>
          <p className="text-xl text-refinex-gray-100 max-w-2xl mx-auto">
            Start free for evaluation. Pay for higher volume and faster support when you ship to production.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`p-8 flex flex-col ${
                tier.highlighted
                  ? 'border-2 border-refinex-cyan shadow-glow-cyan'
                  : ''
              }`}
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold gradient-text">
                    {tier.price}
                  </span>
                  <span className="text-refinex-gray-100">{tier.period}</span>
                </div>
                {tier.usage && (
                  <p className="text-sm text-refinex-cyan">{tier.usage}</p>
                )}
                <p className="text-refinex-gray-100 text-sm mt-2">
                  {tier.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-refinex-gray-100"
                  >
                    <Check className="w-5 h-5 text-semantic-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href={tier.href}>
                <Button
                  variant={tier.highlighted ? 'primary' : 'outline'}
                  className="w-full"
                >
                  {tier.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>

        {/* Legal Disclaimers */}
        <div className="bg-refinex-navy-light border border-refinex-cyan/20 rounded-lg p-6 mb-16">
          <h3 className="text-lg font-semibold text-white mb-4">
            Pricing Legal Notes
          </h3>
          <div className="space-y-3 text-sm text-refinex-gray-100">
            <p>
              <strong>Usage billing:</strong> Signals are metered by successful responses. If your system retries, you control retry behavior.
            </p>
            <p>
              <strong>Savings disclaimer:</strong> Spot market savings vary widely. RefineX provides recommendations based on public market conditions; you remain responsible for workload placement and reliability design.
            </p>
            <p>
              <strong>Service scope:</strong> All pricing excludes your cloud provider costs. RefineX emits read-only recommendations — you control execution.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <Card key={faq.question} className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {faq.question}
                </h3>
                <p className="text-refinex-gray-100">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-refinex-gray-100 mb-8">
            Start with 10 free signals. No credit card required.
          </p>
          <Link href="/docs/quickstart">
            <Button size="lg">Start Free Now</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
