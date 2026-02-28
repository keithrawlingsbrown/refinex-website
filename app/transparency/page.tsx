import { getActiveSignal, getSystemHealth, getDashboardSnapshot, getPublicSignalHistory, getSuppressedSignals } from '@/lib/refinex-api';

function ConfidenceBadge({ score }: { score: number }) {
  const level = score >= 0.75 ? 'HIGH' : score >= 0.5 ? 'MEDIUM' : 'WATCH';
  const colors = {
    HIGH: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#10B981' },
    MEDIUM: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', text: '#F59E0B' },
    WATCH: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', text: '#EF4444' },
  };
  const c = colors[level];
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
      {level}
    </span>
  );
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className="inline-block w-2 h-2 rounded-full mr-2"
      style={{ background: ok ? '#10B981' : '#F59E0B' }} />
  );
}

export const revalidate = 60;

export default async function TransparencyPage() {
  const [signal, health, dashboard, history, suppressed] = await Promise.all([
    getActiveSignal(),
    getSystemHealth(),
    getDashboardSnapshot(),
    getPublicSignalHistory(),
    getSuppressedSignals(),
  ]);

  const activeCount = dashboard?.product_metrics?.active_signals ?? '—';
  const signals24h = dashboard?.product_metrics?.signals_24h ?? '—';
  const isHealthy = (health?.issues_detected ?? 0) === 0;

  return (
    <main className="min-h-screen px-6 py-24" style={{ background: '#0A0F1E' }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background: 'rgba(37,99,235,0.15)', color: '#3B82F6', border: '1px solid rgba(37,99,235,0.3)' }}>
            LIVE DATA
          </span>
          <h1 className="text-4xl font-bold text-refinex-primary mb-4">Signal Transparency</h1>
          <p className="text-refinex-secondary text-lg max-w-2xl">
            Every signal RefineX generates is logged here in real time.
            We show what fired, what was suppressed, and why — including signals we chose not to deliver.
          </p>
        </div>

        {/* System Status */}
        <div className="rounded-xl p-6 mb-8 card-border" style={{ background: '#0F172A' }}>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-refinex-muted mb-4">System Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'API', value: 'Operational', ok: true },
              { label: 'Signal Engine', value: isHealthy ? 'Healthy' : 'Degraded', ok: isHealthy },
              { label: 'Active Signals', value: String(activeCount), ok: true },
              { label: 'Signals (24h)', value: String(signals24h), ok: true },
            ].map(item => (
              <div key={item.label}>
                <p className="text-refinex-muted text-xs mb-1">{item.label}</p>
                <p className="text-refinex-primary text-sm font-medium flex items-center">
                  <StatusDot ok={item.ok} />{item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Live Signal */}
        {signal && (
          <div className="rounded-xl p-6 mb-4 card-border" style={{ background: '#0F172A' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-refinex-muted">Latest Signal</h2>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold"
                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                LIVE
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Region', value: signal.region ?? '—' },
                { label: 'Instance', value: signal.instance_type ?? '—' },
                { label: 'Confidence', value: <ConfidenceBadge score={signal.confidence ?? 0} /> },
                { label: 'Spot Savings', value: signal.savings_pct ? `${signal.savings_pct}%` : '—' },
                { label: 'Action', value: signal.action ?? '—' },
                { label: 'Suppressed', value: signal.suppressed ? 'Yes' : 'No' },
              ].map(item => (
                <div key={item.label} className="font-mono">
                  <p className="text-refinex-muted text-xs mb-1">{item.label}</p>
                  <p className="text-refinex-primary text-sm">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION A — Field Glossary */}
        <div className="rounded-xl p-6 mb-8 card-border" style={{ background: '#0F172A' }}>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-refinex-muted mb-4">Signal Field Reference</h2>
          <div className="space-y-3">
            {[
              { field: 'region', desc: 'AWS availability zone where the spot market condition was detected.' },
              { field: 'instance_type', desc: 'EC2 instance class evaluated. RefineX scores each instance independently per region.' },
              { field: 'confidence', desc: 'Regime-adjusted probability this represents a genuine arbitrage opportunity. Calculated after volatility gating and market state classification.' },
              { field: 'savings_pct', desc: 'Estimated cost reduction vs on-demand pricing at time of signal generation. Not a guarantee — spot prices shift continuously.' },
              { field: 'action', desc: 'Recommended response: buy_spot (conditions favourable), hold (marginal), or avoid (volatility too high).' },
              { field: 'suppressed', desc: 'If true, the signal was generated internally but not delivered. Suppression reasons are logged below.' },
              { field: 'regime', desc: 'Current market state classification: STABLE_DISCOUNT, VOLATILE, TRANSITIONING, or COMPRESSED. Regime affects confidence scoring.' },
            ].map(item => (
              <div key={item.field} className="flex gap-4 items-start">
                <code className="text-xs font-mono flex-shrink-0 px-2 py-0.5 rounded"
                  style={{ background: 'rgba(37,99,235,0.15)', color: '#3B82F6', minWidth: '140px' }}>
                  {item.field}
                </code>
                <p className="text-refinex-secondary text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION B — Confidence Band Table */}
        <div className="rounded-xl p-6 mb-8 card-border" style={{ background: '#0F172A' }}>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-refinex-muted mb-4">Confidence Bands</h2>
          <p className="text-refinex-secondary text-sm mb-4">
            RefineX uses three confidence bands instead of raw scores.
            Bands are recalculated every cycle based on current regime state — a signal that scores HIGH in a stable market
            may be reclassified to WATCH if volatility increases before delivery.
          </p>
          <div className="space-y-3">
            {[
              { band: 'HIGH', range: '≥ 0.75', color: '#10B981', border: 'rgba(16,185,129,0.3)', bg: 'rgba(16,185,129,0.08)', desc: 'Delivered to autoscaler. Regime is stable, price spread is significant, false positive risk is low. Act on this.' },
              { band: 'MEDIUM', range: '0.50 – 0.74', color: '#F59E0B', border: 'rgba(245,158,11,0.3)', bg: 'rgba(245,158,11,0.08)', desc: 'Delivered with advisory flag. Conditions are favourable but regime shows early instability markers. Monitor closely.' },
              { band: 'WATCH', range: '< 0.50', color: '#EF4444', border: 'rgba(239,68,68,0.3)', bg: 'rgba(239,68,68,0.08)', desc: 'Suppressed. Signal detected but confidence insufficient for delivery. Logged for audit purposes only.' },
            ].map(item => (
              <div key={item.band} className="flex gap-4 items-start p-3 rounded-lg"
                style={{ background: item.bg, border: `1px solid ${item.border}` }}>
                <div className="flex-shrink-0 text-center" style={{ minWidth: '80px' }}>
                  <span className="text-xs font-bold" style={{ color: item.color }}>{item.band}</span>
                  <p className="text-xs mt-0.5" style={{ color: item.color, opacity: 0.7 }}>{item.range}</p>
                </div>
                <p className="text-refinex-secondary text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION C — Recent Signal History */}
        {history && history.length > 0 && (
          <div className="rounded-xl p-6 mb-8 card-border" style={{ background: '#0F172A' }}>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-refinex-muted mb-4">
              Recent Signal Log
            </h2>
            <p className="text-refinex-secondary text-sm mb-4">
              Last {Math.min(history.length, 10)} signals processed by the engine, including suppressed output.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-refinex-muted border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    {['Region', 'Instance', 'Confidence', 'Action', 'Savings', 'Suppressed'].map(h => (
                      <th key={h} className="text-left pb-2 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 10).map((s: any, i: number) => (
                    <tr key={i} className="border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                      <td className="py-2 pr-4 text-refinex-secondary">{s.region ?? '—'}</td>
                      <td className="py-2 pr-4 text-refinex-secondary">{s.instance_type ?? '—'}</td>
                      <td className="py-2 pr-4"><ConfidenceBadge score={s.confidence ?? 0} /></td>
                      <td className="py-2 pr-4 text-refinex-secondary">{s.action ?? '—'}</td>
                      <td className="py-2 pr-4 text-refinex-secondary">{s.savings_pct ? `${s.savings_pct}%` : '—'}</td>
                      <td className="py-2 pr-4">
                        <span style={{ color: s.suppressed ? '#EF4444' : '#10B981' }}>
                          {s.suppressed ? 'Yes' : 'No'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Why We Suppress */}
        <div className="rounded-xl p-6 card-border" style={{ background: '#0F172A' }}>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-refinex-muted mb-4">Why We Suppress Signals</h2>
          <p className="text-refinex-secondary text-sm mb-4">
            Overfiring destroys trust faster than underfiring. RefineX suppresses signals that pass
            initial detection but fail one of four quality gates before delivery.
          </p>
          <div className="space-y-4">
            {[
              { title: 'Confidence below threshold', desc: 'Signal confidence score fell below 0.75 after regime adjustment. Raw price spread was present but market state classification reduced conviction.' },
              { title: 'Six-hour clustering window', desc: 'A higher-confidence signal for the same region and instance type was already active. Duplicate suppression prevents autoscaler noise.' },
              { title: 'High-volatility regime', desc: 'Market state classified as VOLATILE or TRANSITIONING. Price spreads in volatile regimes revert faster than autoscaler reaction time.' },
              { title: 'Stale underlying data', desc: 'Source pricing data was older than the acceptable freshness threshold. RefineX does not deliver signals derived from stale inputs.' },
            ].map(item => (
              <div key={item.title} className="flex gap-3">
                <div className="w-1 rounded-full flex-shrink-0 mt-1" style={{ background: '#2563EB', minHeight: '40px' }} />
                <div>
                  <p className="text-refinex-primary text-sm font-medium mb-1">{item.title}</p>
                  <p className="text-refinex-secondary text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-refinex-muted text-xs text-center mt-12">
          Data refreshes every 60 seconds. Last updated: {new Date().toUTCString()}
        </p>

      </div>
    </main>
  );
}
