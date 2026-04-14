import { getActiveSignal, getSystemHealth, getDashboardSnapshot, getPublicSignalHistory, getRegionalSuppression } from '@/lib/refinex-api';

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

function ConflictStatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; border: string; text: string; label: string }> = {
    direct_impact: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', text: '#EF4444', label: 'DIRECT IMPACT' },
    displacement_demand: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', text: '#F59E0B', label: 'DISPLACEMENT' },
  };
  const c = config[status] || { bg: 'rgba(100,116,139,0.15)', border: 'rgba(100,116,139,0.3)', text: '#94A3B8', label: status.toUpperCase() };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
      {c.label}
    </span>
  );
}

function PhaseIndicator({ phase, name }: { phase: number; name: string }) {
  const phases = [
    { n: 1, label: 'Active strikes', status: 'complete' },
    { n: 2, label: 'Ceasefire window', status: 'complete' },
    { n: 3, label: 'Talks collapse, blockade', status: 'active' },
    { n: 4, label: 'Post-ceasefire unknown', status: 'pending' },
    { n: 5, label: 'Displacement demand', status: 'monitoring' },
    { n: 6, label: 'Double choke point', status: 'monitoring' },
    { n: 7, label: 'Semiconductor supply', status: 'dormant' },
    { n: 8, label: 'Architectural reckoning', status: 'monitoring' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {phases.map(p => {
        const isActive = p.n === phase;
        const isComplete = p.status === 'complete';
        const bg = isActive ? 'rgba(239,68,68,0.2)' : isComplete ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.08)';
        const border = isActive ? 'rgba(239,68,68,0.4)' : isComplete ? 'rgba(16,185,129,0.2)' : 'rgba(100,116,139,0.15)';
        const color = isActive ? '#EF4444' : isComplete ? '#10B981' : '#475569';
        return (
          <span key={p.n} className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs"
            style={{ background: bg, border: `1px solid ${border}`, color }}>
            <span className="font-bold">{p.n}</span>
            <span className="hidden sm:inline">{p.label}</span>
          </span>
        );
      })}
    </div>
  );
}

export const revalidate = 60;

export default async function TransparencyPage() {
  const [signal, health, dashboard, historyData, regional] = await Promise.all([
    getActiveSignal(),
    getSystemHealth(),
    getDashboardSnapshot(),
    getPublicSignalHistory(),
    getRegionalSuppression(30),
  ]);

  const history = historyData.signals;
  const suppressionRate = historyData.suppression_rate;
  const deliveredCount = historyData.delivered;
  const suppressedCount = historyData.suppressed;

  const activeCount = dashboard?.product_metrics?.active_signals ?? '—';
  const signals24h = dashboard?.product_metrics?.signals_24h ?? '—';
  const isHealthy = (health?.issues_detected ?? 0) === 0;

  const conflictPhase = regional?.conflict;
  const regions = regional?.regions || [];
  const conflictRegions = regions.filter((r: any) => r.conflict);
  const nonConflictRegions = regions.filter((r: any) => !r.conflict);

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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'API', value: 'Operational', ok: true },
              { label: 'Signal Engine', value: isHealthy ? 'Healthy' : 'Degraded', ok: isHealthy },
              { label: 'Active Signals', value: String(activeCount), ok: true },
              { label: 'Signals (24h)', value: String(signals24h), ok: true },
              { label: 'Suppression Rate', value: `${suppressionRate}%`, ok: true },
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

        {/* ========== CONFLICT INTELLIGENCE SECTION ========== */}
        {conflictPhase && (
          <>
            <div className="rounded-xl p-6 mb-4 card-border" style={{ background: '#0F172A', borderColor: 'rgba(239,68,68,0.2)' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-refinex-muted">Conflict Intelligence</h2>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  ACTIVE CONFLICT
                </span>
              </div>

              {/* Conflict Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-refinex-muted text-xs mb-1">Days Since Strikes</p>
                  <p className="text-refinex-primary text-xl font-bold font-mono">{conflictPhase.days_since_strikes}</p>
                </div>
                <div>
                  <p className="text-refinex-muted text-xs mb-1">Current Phase</p>
                  <p className="text-refinex-primary text-xl font-bold font-mono">{conflictPhase.current_phase}/8</p>
                </div>
                <div>
                  <p className="text-refinex-muted text-xs mb-1">Ceasefire Expires</p>
                  <p className="text-refinex-primary text-sm font-bold font-mono">{conflictPhase.ceasefire_expires}</p>
                </div>
                <div>
                  <p className="text-refinex-muted text-xs mb-1">Oil Price</p>
                  <p className="text-refinex-primary text-sm font-bold font-mono" style={{ color: '#F59E0B' }}>
                    {conflictPhase.oil_price_indicator === 'elevated' ? 'ELEVATED' : conflictPhase.oil_price_indicator?.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Phase Timeline */}
              <div className="mb-6">
                <p className="text-refinex-muted text-xs mb-2">Phase Map</p>
                <PhaseIndicator phase={conflictPhase.current_phase} name={conflictPhase.phase_name} />
              </div>

              <p className="text-refinex-secondary text-sm">
                {conflictPhase.phase_name}. Signal data is updated continuously regardless of diplomatic status.
                The confidence band recovers when the physical cause resolves — not when a headline says it should.
              </p>
            </div>

            {/* Regional Suppression Dashboard */}
            {conflictRegions.length > 0 && (
              <div className="rounded-xl p-6 mb-8 card-border" style={{ background: '#0F172A' }}>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-refinex-muted mb-4">
                  Regional Suppression — Conflict-Affected Regions
                </h2>
                <p className="text-refinex-secondary text-sm mb-4">
                  Suppression data for regions affected by the Gulf conflict, updated every 60 seconds.
                  Direct impact regions show physical infrastructure damage. Displacement regions show capacity pressure from migrated workloads.
                </p>
                <div className="space-y-4">
                  {conflictRegions.map((r: any) => (
                    <div key={r.region} className="rounded-lg p-4"
                      style={{
                        background: r.conflict.conflict_status === 'direct_impact' ? 'rgba(239,68,68,0.05)' : 'rgba(245,158,11,0.05)',
                        border: `1px solid ${r.conflict.conflict_status === 'direct_impact' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)'}`,
                      }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <code className="text-sm font-mono font-bold text-refinex-primary">{r.region}</code>
                          <ConflictStatusBadge status={r.conflict.conflict_status} />
                        </div>
                        <ConfidenceBadge score={r.avg_confidence} />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div className="font-mono">
                          <p className="text-refinex-muted text-xs">Suppression</p>
                          <p className="text-sm font-bold" style={{ color: r.suppression_rate > 50 ? '#EF4444' : r.suppression_rate > 30 ? '#F59E0B' : '#10B981' }}>
                            {r.suppression_rate}%
                          </p>
                        </div>
                        <div className="font-mono">
                          <p className="text-refinex-muted text-xs">Signals</p>
                          <p className="text-refinex-primary text-sm">{r.total_signals}</p>
                        </div>
                        <div className="font-mono">
                          <p className="text-refinex-muted text-xs">Delivered</p>
                          <p className="text-sm" style={{ color: '#10B981' }}>{r.delivered}</p>
                        </div>
                        <div className="font-mono">
                          <p className="text-refinex-muted text-xs">Suppressed</p>
                          <p className="text-sm" style={{ color: '#EF4444' }}>{r.suppressed}</p>
                        </div>
                        <div className="font-mono">
                          <p className="text-refinex-muted text-xs">Cause Code</p>
                          <p className="text-xs" style={{ color: '#94A3B8' }}>{r.conflict.cause_code.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                      {r.conflict.recovery_profile && (
                        <p className="text-xs mt-2" style={{ color: '#475569' }}>
                          Recovery profile: {r.conflict.recovery_profile}
                          {r.conflict.affected_since && ` · Affected since ${r.conflict.affected_since}`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conflict Cause Codes */}
            <div className="rounded-xl p-6 mb-8 card-border" style={{ background: '#0F172A' }}>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-refinex-muted mb-4">Conflict Suppression Cause Codes</h2>
              <p className="text-refinex-secondary text-sm mb-4">
                During active conflicts, suppression cause codes distinguish between direct infrastructure damage
                and secondary effects like displacement demand. Different causes have fundamentally different recovery profiles.
              </p>
              <div className="space-y-3">
                {[
                  { code: 'sustained_infrastructure_damage', desc: 'Physical damage to cloud infrastructure (data centers, power, networking) in the affected region. Recovery requires reconstruction. Timeline: months to years.', color: '#EF4444' },
                  { code: 'active_kinetic_conflict', desc: 'Region is under active military operations. Confidence band suppressed to floor. No recovery timeline until hostilities cease.', color: '#EF4444' },
                  { code: 'ceasefire_monitoring', desc: 'Ceasefire declared but physical damage unresolved. Suppression reduced but not lifted. Confidence band held until data confirms sustained recovery.', color: '#F59E0B' },
                  { code: 'displacement_capacity_pressure', desc: 'Destination region absorbing migrated workloads from conflict-affected regions. Spot capacity compressed. Recovery depends on demand normalization.', color: '#F59E0B' },
                  { code: 'connectivity_degradation', desc: 'Submarine cable or routing path impaired by conflict activity. Latency increased, bandwidth reduced. Recovery requires cable repair in non-contested waters.', color: '#F59E0B' },
                  { code: 'post_conflict_reconstruction', desc: 'Hostilities ceased, reconstruction underway. Confidence band recovering toward pre-conflict baseline over a statistically meaningful window.', color: '#10B981' },
                ].map(item => (
                  <div key={item.code} className="flex gap-3">
                    <div className="w-1 rounded-full flex-shrink-0 mt-1" style={{ background: item.color, minHeight: '40px' }} />
                    <div>
                      <code className="text-xs font-mono px-2 py-0.5 rounded"
                        style={{ background: 'rgba(37,99,235,0.1)', color: '#3B82F6' }}>
                        {item.code}
                      </code>
                      <p className="text-refinex-secondary text-sm mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ========== ORIGINAL SECTIONS ========== */}

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

        {/* All Regions Table (non-conflict) */}
        {nonConflictRegions.length > 0 && (
          <div className="rounded-xl p-6 mb-8 card-border" style={{ background: '#0F172A' }}>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-refinex-muted mb-4">
              Regional Suppression — All Regions
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-refinex-muted border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    {['Region', 'Signals', 'Delivered', 'Suppressed', 'Rate', 'Avg Confidence'].map(h => (
                      <th key={h} className="text-left pb-2 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {nonConflictRegions.map((r: any) => (
                    <tr key={r.region} className="border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                      <td className="py-2 pr-4 text-refinex-secondary">{r.region}</td>
                      <td className="py-2 pr-4 text-refinex-secondary">{r.total_signals}</td>
                      <td className="py-2 pr-4" style={{ color: '#10B981' }}>{r.delivered}</td>
                      <td className="py-2 pr-4" style={{ color: '#EF4444' }}>{r.suppressed}</td>
                      <td className="py-2 pr-4 text-refinex-secondary">{r.suppression_rate}%</td>
                      <td className="py-2 pr-4"><ConfidenceBadge score={r.avg_confidence} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              { band: 'HIGH', range: '>= 0.75', color: '#10B981', border: 'rgba(16,185,129,0.3)', bg: 'rgba(16,185,129,0.08)', desc: 'Delivered to autoscaler. Regime is stable, price spread is significant, false positive risk is low. Act on this.' },
              { band: 'MEDIUM', range: '0.50 - 0.74', color: '#F59E0B', border: 'rgba(245,158,11,0.3)', bg: 'rgba(245,158,11,0.08)', desc: 'Delivered with advisory flag. Conditions are favourable but regime shows early instability markers. Monitor closely.' },
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
              Last {history.length} signals — {deliveredCount} delivered, {suppressedCount} suppressed ({suppressionRate}% suppression rate)
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-refinex-muted border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    {['Region', 'Instance', 'Confidence', 'Action', 'Savings', 'Suppressed', 'Reason'].map(h => (
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
                      <td className="py-2 pr-4" style={{ color: '#64748B', fontSize: '11px' }}>
                        {s.suppression_reason
                          ? s.suppression_reason.replace(/_/g, ' ')
                          : s.suppressed ? 'ttl expired' : '—'}
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
              { title: 'Conflict-zone suppression', desc: 'Region is under active military conflict or sustained physical infrastructure damage. Confidence band suppressed until the physical cause resolves and suppression rates return to pre-conflict baselines.' },
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
