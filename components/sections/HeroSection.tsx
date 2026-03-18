import Link from 'next/link'
import { getActiveSignal } from '@/lib/refinex-api'

const FALLBACK_SIGNAL = {
  signal_id: 'rxs_1a2b3c',
  region: 'us-east-1',
  instance: 'c5.2xlarge',
  confidence: 'HIGH',
  regime: 'STABLE_DISCOUNT',
  spot_savings: '-68%',
  suppressed: false,
}

function formatSignalRows(signal: Record<string, unknown>) {
  return [
    ['signal_id', signal.signal_id || signal.id || FALLBACK_SIGNAL.signal_id, '#94A3B8'],
    ['region', signal.region || FALLBACK_SIGNAL.region, '#F8FAFC'],
    ['instance', signal.instance_type || signal.instance || FALLBACK_SIGNAL.instance, '#F8FAFC'],
    ['confidence', signal.confidence_label || signal.confidence || FALLBACK_SIGNAL.confidence, '#10B981'],
    ['regime', signal.regime || signal.market_regime || FALLBACK_SIGNAL.regime, '#3B82F6'],
    ['spot_savings', signal.savings_percent ? `-${signal.savings_percent}%` : FALLBACK_SIGNAL.spot_savings, '#10B981'],
    ['suppressed', String(signal.suppressed ?? FALLBACK_SIGNAL.suppressed), '#F59E0B'],
  ]
}

export default async function HeroSection() {
  let signal: Record<string, unknown> = FALLBACK_SIGNAL
  let isLive = false

  try {
    const data = await getActiveSignal()
    if (data && (data.signal || data.id || data.signal_id)) {
      signal = data.signal || data
      isLive = true
    }
  } catch {
    // Fallback to static
  }

  const rows = formatSignalRows(signal)

  return (
    <section className="relative pt-32 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — Copy */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8"
              style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', color: '#3B82F6' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-refinex-success inline-block" />
              {isLive ? 'Live signal · Production' : 'Advisory signals · Preview mode'}
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-refinex-primary leading-tight mb-6">
              Spot instance intelligence<br />
              <span style={{ color: '#3B82F6' }}>for your autoscaler</span>
            </h1>

            <p className="text-lg text-refinex-secondary leading-relaxed mb-8 max-w-lg">
              Confidence-scored AWS spot market signals with regime context.
              API-first. Advisory-only. Built for FinOps teams who want
              data before decisions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/docs/quickstart"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90"
                style={{ background: '#2563EB' }}>
                Start free — 90 days
              </Link>
              <Link href="/transparency"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all text-refinex-secondary hover:text-refinex-primary"
                style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                View live signals →
              </Link>
            </div>
          </div>

          {/* Right — Signal Card */}
          <div className="relative">
            <div className="rounded-xl p-6" style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-refinex-muted">
                  {isLive ? 'LIVE SIGNAL' : 'SAMPLE SIGNAL'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={isLive
                    ? { background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }
                    : { background: 'rgba(71,85,105,0.2)', color: '#475569', border: '1px solid rgba(71,85,105,0.3)' }
                  }>
                  {isLive && <span className="w-1.5 h-1.5 rounded-full bg-refinex-success inline-block animate-pulse" />}
                  {isLive ? 'LIVE' : 'SAMPLE'}
                </span>
              </div>
              <div className="space-y-3 font-mono text-sm">
                {rows.map(([key, val, color]) => (
                  <div key={key as string} className="flex justify-between items-center">
                    <span className="text-refinex-muted">{key as string}</span>
                    <span style={{ color: color as string }}>{val as string}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs text-refinex-muted">Advisory only — your autoscaler decides</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
