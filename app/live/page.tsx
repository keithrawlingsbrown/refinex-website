import { getSignalNow } from '@/lib/refinex-api';

export const revalidate = 30;

export const metadata = {
  title: 'Live Signal — RefineX',
  description: 'One command. Real data. Current best AWS Spot arbitrage signal, no auth required.',
};

const API_URL = process.env.REFINEX_API_URL || 'https://refinex-api.onrender.com';

function Field({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-mono" style={{ color: '#475569' }}>{label}</span>
      <span
        className="text-sm font-mono font-semibold"
        style={{ color: highlight ? '#10B981' : '#E2E8F0' }}
      >
        {value}
      </span>
    </div>
  );
}

export default async function LivePage() {
  const signal = await getSignalNow();
  const curlUrl = `${API_URL}/v1/signals/now`;
  const hasSignal = signal && signal.action === 'buy_spot';

  return (
    <main className="min-h-screen px-6 py-24" style={{ background: '#0A0F1E' }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-5"
            style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            LIVE · refreshes every 30s
          </span>
          <h1 className="text-3xl font-bold mb-3" style={{ color: '#F1F5F9' }}>
            Current Best Spot Signal
          </h1>
          <p style={{ color: '#64748B' }} className="text-sm">
            No auth. No signup. One command — real data from the live signal engine.
          </p>
        </div>

        {/* Curl command */}
        <div
          className="rounded-xl p-5 mb-8 font-mono text-sm"
          style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#FEBC2E' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
            </div>
            <span className="text-xs" style={{ color: '#475569' }}>terminal</span>
          </div>
          <p style={{ color: '#64748B' }} className="text-xs mb-2 select-none">$ try it yourself</p>
          <p className="text-green-400 break-all select-all">
            curl {curlUrl}
          </p>
        </div>

        {/* Live signal card */}
        <div
          className="rounded-xl p-6 mb-6"
          style={{
            background: '#0F172A',
            border: hasSignal
              ? '1px solid rgba(16,185,129,0.25)'
              : '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>
              Signal Output
            </h2>
            {hasSignal ? (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded"
                style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' }}
              >
                BUY_SPOT
              </span>
            ) : (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded"
                style={{ background: 'rgba(100,116,139,0.12)', color: '#94A3B8', border: '1px solid rgba(100,116,139,0.2)' }}
              >
                USE_ON_DEMAND
              </span>
            )}
          </div>

          {signal ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              <Field label="action" value={signal.action} highlight={hasSignal} />
              <Field label="instance_type" value={signal.instance_type ?? '—'} />
              <Field label="region" value={signal.region ?? '—'} />
              <Field
                label="spot_price_usd"
                value={signal.spot_price_usd != null ? `$${signal.spot_price_usd}` : '—'}
              />
              <Field
                label="on_demand_price_usd"
                value={signal.on_demand_price_usd != null ? `$${signal.on_demand_price_usd}` : '—'}
              />
              <Field
                label="discount_pct"
                value={signal.discount_pct != null ? `${signal.discount_pct}%` : '—'}
                highlight={hasSignal}
              />
              <Field label="confidence" value={signal.confidence ?? '—'} />
              <Field label="ttl_minutes" value={signal.ttl_minutes != null ? `${signal.ttl_minutes}m` : '—'} />
              <Field
                label="suppressed_last_6h"
                value={signal.suppressed_last_6h ?? 0}
              />
            </div>
          ) : (
            <p className="text-sm font-mono" style={{ color: '#475569' }}>
              No signal data — API unreachable.
            </p>
          )}
        </div>

        {/* Suppression callout */}
        <div
          className="rounded-xl p-5 mb-10"
          style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#3B82F6' }}>
            What is suppressed_last_6h?
          </p>
          <p className="text-sm" style={{ color: '#94A3B8' }}>
            Signals RefineX detected but chose not to fire. Each one passed initial detection but failed
            a quality gate — confidence below threshold, price volatility too high, or duplicate within
            the six-hour clustering window. Suppression is the product.{' '}
            <a href="/transparency" style={{ color: '#3B82F6' }} className="underline">
              Full suppression log →
            </a>
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-sm mb-4" style={{ color: '#64748B' }}>
            Want the full feed? Filtered by region, instance type, and confidence band?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/docs/quickstart"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold"
              style={{ background: '#2563EB', color: '#fff' }}
            >
              Start free — 90 days
            </a>
            <a
              href="/transparency"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              View Signal Log
            </a>
          </div>
        </div>

        <p className="text-xs text-center mt-10" style={{ color: '#334155' }}>
          Refreshed: {new Date().toUTCString()} · No auth required · No rate limit on this endpoint
        </p>

      </div>
    </main>
  );
}
