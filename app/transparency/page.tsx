import { getActiveSignal, getSystemHealth, getDashboardSnapshot } from '@/lib/refinex-api';

function ConfidenceBadge({ score }: { score: number }) {
  const band = score >= 0.8 ? 'HIGH' : score >= 0.6 ? 'MEDIUM' : 'WATCH';
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    HIGH:   { bg: 'rgba(16,185,129,0.15)',  text: '#10B981', border: 'rgba(16,185,129,0.3)' },
    MEDIUM: { bg: 'rgba(245,158,11,0.15)',  text: '#F59E0B', border: 'rgba(245,158,11,0.3)' },
    WATCH:  { bg: 'rgba(239,68,68,0.15)',   text: '#EF4444', border: 'rgba(239,68,68,0.3)'  },
  };
  const c = colors[band];
  return (
    <span className="px-2 py-0.5 rounded text-xs font-bold font-mono"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      {band}
    </span>
  );
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm"
      style={{ color: ok ? '#10B981' : '#F59E0B' }}>
      <span className="w-2 h-2 rounded-full inline-block"
        style={{ background: ok ? '#10B981' : '#F59E0B' }} />
      {ok ? 'Operational' : 'Degraded'}
    </span>
  );
}

export default async function TransparencyPage() {
  const [signal, health, dashboard] = await Promise.all([
    getActiveSignal(),
    getSystemHealth(),
    getDashboardSnapshot(),
  ]);

  const now = new Date().toISOString();
  const systemOk = health && health.issues_detected === 0;
  const activeSignals = dashboard?.product_metrics?.active_signals ?? '—';
  const signals24h = dashboard?.product_metrics?.signals_24h ?? '—';

  return (
    <main className="pt-24 pb-32 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6"
            style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', color: '#3B82F6' }}>
            Public log · Updated every 60 seconds
          </div>
          <h1 className="text-4xl font-bold text-refinex-primary mb-4">Signal Transparency</h1>
          <p className="text-refinex-secondary max-w-xl leading-relaxed">
            RefineX publishes a real-time log of signal activity — what we detected,
            what we suppressed, and why. Confidence bands only. No raw scores, no algorithm internals.
          </p>
        </div>

        {/* System Status */}
        <div className="rounded-xl p-6 mb-8 card-border" style={{ background: '#0F172A' }}>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-refinex-muted mb-4">System Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-refinex-muted mb-1">API</p>
              <StatusDot ok={!!health} />
            </div>
            <div>
              <p className="text-xs text-refinex-muted mb-1">Signal Engine</p>
              <StatusDot ok={systemOk ?? false} />
            </div>
            <div>
              <p className="text-xs text-refinex-muted mb-1">Active Signals</p>
              <p className="text-refinex-primary font-semibold">{activeSignals}</p>
            </div>
            <div>
              <p className="text-xs text-refinex-muted mb-1">Signals (24h)</p>
              <p className="text-refinex-primary font-semibold">{signals24h}</p>
            </div>
          </div>
          <p className="text-xs text-refinex-muted mt-4">Last updated: {now}</p>
        </div>

        {/* Live Signal */}
        {signal?.signal ? (
          <div className="rounded-xl p-6 mb-8 card-border" style={{ background: '#0F172A' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-refinex-muted">Latest Signal</h2>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-refinex-success inline-block animate-pulse" />
                LIVE
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 font-mono text-sm">
              <div>
                <p className="text-refinex-muted text-xs mb-1">Region</p>
                <p className="text-refinex-primary">{signal.signal.source?.region ?? '—'}</p>
              </div>
              <div>
                <p className="text-refinex-muted text-xs mb-1">Instance</p>
                <p className="text-refinex-primary">{signal.signal.asset?.instance_type ?? '—'}</p>
              </div>
              <div>
                <p className="text-refinex-muted text-xs mb-1">Confidence</p>
                <ConfidenceBadge score={signal.signal.confidence ?? 0} />
              </div>
              <div>
                <p className="text-refinex-muted text-xs mb-1">Spot Savings</p>
                <p className="text-refinex-success font-semibold">
                  -{signal.signal.expected_value?.savings_percent ?? 0}%
                </p>
              </div>
              <div>
                <p className="text-refinex-muted text-xs mb-1">Action</p>
                <p className="text-refinex-primary">{signal.signal.action ?? '—'}</p>
              </div>
              <div>
                <p className="text-refinex-muted text-xs mb-1">Suppressed</p>
                <p style={{ color: '#10B981' }}>false</p>
              </div>
            </div>
            <div className="mt-6 pt-4 section-divider">
              <p className="text-xs text-refinex-muted">
                Advisory only — confidence bands only, no raw scores published.
                Signal expires: {signal.signal.expires_at ?? '—'}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl p-6 mb-8 card-border" style={{ background: '#0F172A' }}>
            <p className="text-refinex-muted text-sm">No active signals at this time. Check back shortly.</p>
          </div>
        )}

        {/* What We Suppress */}
        <div className="rounded-xl p-6 card-border" style={{ background: '#0F172A' }}>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-refinex-muted mb-4">
            Why We Suppress Signals
          </h2>
          <div className="space-y-4">
            {[
              ['Confidence below threshold', 'Signals scoring below the minimum confidence band are blocked before delivery.'],
              ['Six-hour clustering', 'Duplicate signals for the same instance type within a six-hour window are suppressed automatically.'],
              ['High-volatility regime', 'When market regime is classified as highly volatile, all signals in that region are suppressed.'],
              ['Stale data', 'Signals generated from price data older than the TTL window are expired and not delivered.'],
            ].map(([title, desc]) => (
              <div key={title} className="flex gap-4">
                <div className="w-1 rounded-full flex-shrink-0 mt-1" style={{ background: '#2563EB', minHeight: '1rem' }} />
                <div>
                  <p className="text-refinex-primary text-sm font-medium mb-1">{title}</p>
                  <p className="text-refinex-secondary text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
