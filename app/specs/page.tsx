import { Metadata } from 'next'
import Card from '@/components/ui/Card'
import { Shield, Zap, Lock, Clock, Globe, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Technical Specifications - RefineX',
  description: 'Technical details and performance characteristics of the RefineX API.',
}

const specs = [
  { label: 'Response Time', value: 'Target: <200ms p99', note: 'Production goal; measured values may vary by region' },
  { label: 'Update Frequency', value: '~Every 5 minutes', note: 'Market-dependent update cadence' },
  { label: 'Signal TTL', value: '~15 minutes', note: 'Signals expire by design to prevent stale decisions' },
  { label: 'Authentication', value: 'API Key', note: 'Header-based: X-API-Key' },
  { label: 'Protocol', value: 'REST (JSON)', note: 'Standard HTTP methods' },
  { label: 'Supported Clouds', value: 'AWS', note: 'Additional cloud providers on the roadmap' },
  { label: 'Data Sources', value: 'Public pricing + market signals', note: 'No customer cloud account access required' },
  { label: 'Rate Limits', value: 'Tier-based', note: 'Free: 100 req/min, Paid: higher limits' },
]

const securityFeatures = [
  {
    icon: Shield,
    title: 'Read-Only Recommendations',
    description: 'RefineX never executes actions in your cloud. You control all workload placement decisions.',
  },
  {
    icon: Lock,
    title: 'No Credentials Required',
    description: 'We consume public pricing data only. You never share cloud credentials with RefineX.',
  },
  {
    icon: CheckCircle,
    title: 'Signal Expiration',
    description: 'All signals have TTL (~15 min) and expire automatically to reduce risk of stale data.',
  },
  {
    icon: Zap,
    title: 'Kill Switches',
    description: 'Admin-level controls to disable signal generation per cloud provider or globally.',
  },
  {
    icon: Clock,
    title: 'Circuit Breakers',
    description: 'Automatic protection against bad data feeds or upstream API failures.',
  },
  {
    icon: Globe,
    title: 'Governed Automation',
    description: 'Conservative defaults and admin gating. Designed for safe, deterministic behavior.',
  },
]

export default function TechnicalSpecsPage() {
  return (
    <div className="min-h-screen bg-gradient-hero py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Technical Specifications
          </h1>
          <p className="text-xl text-refinex-gray-100 max-w-3xl mx-auto">
            Performance targets, reliability posture, and security design of the RefineX API.
          </p>
        </div>

        {/* API Overview */}
        <Card className="p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">API Overview</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody className="divide-y divide-refinex-cyan/20">
                {specs.map((spec) => (
                  <tr key={spec.label}>
                    <td className="py-4 pr-8 text-refinex-gray-100 font-medium">
                      {spec.label}
                    </td>
                    <td className="py-4 pr-8">
                      <div className="text-white font-semibold">{spec.value}</div>
                      <div className="text-sm text-refinex-gray-100 opacity-75 mt-1">
                        {spec.note}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Performance Details */}
        <Card className="p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">
            Performance & Latency
          </h2>
          <div className="space-y-4 text-refinex-gray-100">
            <p>
              <strong className="text-white">Target:</strong> p99 latency under 200ms for signal retrieval endpoints. Actual performance may vary based on network conditions, query complexity, and geographic region.
            </p>
            <p>
              <strong className="text-white">Update cadence:</strong> Spot prices are ingested approximately every 5 minutes from supported cloud providers. Signal recalculation happens continuously as new data arrives.
            </p>
            <p>
              <strong className="text-white">TTL enforcement:</strong> All signals include an <code className="text-refinex-cyan">expires_at</code> timestamp (typically ~15 minutes from creation). Expired signals are filtered from active responses.
            </p>
          </div>
        </Card>

        {/* Security & Safety */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Security & Safety Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((feature) => (
              <Card key={feature.title} className="p-6" hover>
                <feature.icon className="w-8 h-8 text-refinex-cyan mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-refinex-gray-100">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Reliability Posture */}
        <Card className="p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">
            Reliability Posture
          </h2>
          <div className="space-y-4 text-refinex-gray-100">
            <p>
              <strong className="text-white">Read-only architecture:</strong> RefineX provides recommendations based on public market conditions. Client systems should implement safe fallback strategies (e.g., on-demand capacity) when signals are absent, expired, or confidence is low.
            </p>
            <p>
              <strong className="text-white">You control execution:</strong> RefineX does not launch, terminate, or migrate workloads. All capacity decisions remain under your infrastructure&apos;s control.
            </p>
            <p>
              <strong className="text-white">No guarantees:</strong> Spot market conditions change rapidly. Past signal accuracy does not guarantee future performance. Your systems should always have fallback logic.
            </p>
          </div>
        </Card>

        {/* Infrastructure */}
        <Card className="p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">
            Infrastructure
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-refinex-gray-100">
            <div>
              <h3 className="font-semibold text-white mb-2">Current Support</h3>
              <ul className="space-y-2">
                <li>• AWS EC2 Spot (multiple regions)</li>
                <li>• REST API (JSON responses)</li>
                <li>• API key authentication</li>
                <li>• PostgreSQL + Redis storage</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Roadmap</h3>
              <ul className="space-y-2">
                <li>• GCP Preemptible VMs</li>
                <li>• Azure Spot VMs</li>
                <li>• Additional instance families</li>
                <li>• Regional expansion</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Compliance Note */}
        <Card className="p-8 bg-refinex-navy-light border-refinex-cyan/30">
          <h2 className="text-2xl font-bold text-white mb-4">
            Compliance & Legal
          </h2>
          <div className="space-y-3 text-refinex-gray-100">
            <p>
              <strong className="text-white">Data processing:</strong> RefineX processes only public cloud pricing data. We do not require, store, or process customer workload data, cloud credentials, or personally identifiable information.
            </p>
            <p>
              <strong className="text-white">No SLA (MVP):</strong> The current version does not include formal SLA commitments. Enterprise plans may include optional SLA packages.
            </p>
            <p>
              <strong className="text-white">Liability:</strong> RefineX provides recommendations. You remain responsible for capacity planning, reliability design, and cloud costs incurred by your infrastructure.
            </p>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-white mb-4">
            Questions About Technical Implementation?
          </h2>
          <p className="text-refinex-gray-100 mb-6">
            Check our API documentation or reach out for technical onboarding.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/api-reference"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-button text-white font-semibold hover:scale-105 transition-transform"
            >
              View API Reference
            </a>
            <a
              href="/enterprise"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border-2 border-refinex-cyan text-refinex-cyan font-semibold hover:bg-refinex-cyan/10 transition-colors"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
