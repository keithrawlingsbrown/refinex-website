import Link from 'next/link'

const quickstartCode = `# Get single best action for autoscaler
curl -H "X-API-Key: sk_live_..." \\
  "https://api.refinex.io/v1/signals/active?cloud=aws&region=us-east-1&instance_type=c7g.xlarge"

# Response
{
  "action": "buy_spot",
  "signal": {
    "signal_id": "01956789-abcd-7000-8000-123456789abc",
    "type": "spot_arbitrage",
    "confidence": 0.94,
    "expected_value": {
      "savings_percent": 70.6,
      "savings_usd_per_hour": 0.102,
      "risk_adjusted_savings": 0.098
    },
    "ttl": 600,
    "expires_at": "2026-01-13T15:33:45Z"
  }
}`

export default function QuickstartSection() {
  return (
    <section className="py-20 section-divider">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-refinex-primary mb-4">
            Get started in minutes
          </h2>
          <p className="text-lg text-refinex-secondary">
            One HTTP call. One decision. No complexity.
          </p>
        </div>

        <div className="rounded-xl overflow-hidden"
          style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 px-4 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="w-3 h-3 rounded-full" style={{ background: '#EF4444' }} />
            <span className="w-3 h-3 rounded-full" style={{ background: '#F59E0B' }} />
            <span className="w-3 h-3 rounded-full" style={{ background: '#10B981' }} />
            <span className="ml-2 text-xs text-refinex-muted font-mono">terminal</span>
          </div>
          <pre className="p-6 overflow-x-auto text-sm font-mono leading-relaxed text-refinex-secondary">
            {quickstartCode}
          </pre>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Link href="/docs"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold btn-outline-subtle">
            Full Documentation
          </Link>
          <Link href="/api-reference"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold btn-outline-subtle">
            API Reference
          </Link>
        </div>
      </div>
    </section>
  )
}
