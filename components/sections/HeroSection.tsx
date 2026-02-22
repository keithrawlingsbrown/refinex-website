'use client';

import Link from 'next/link';

const SAMPLE_SIGNAL = {
  signal_id: 'rxs_1a2b3c',
  region: 'us-east-1',
  instance: 'c5.2xlarge',
  confidence: 'HIGH',
  regime: 'STABLE_DISCOUNT',
  spot_savings: '-68%',
  suppressed: false,
  timestamp: new Date().toISOString(),
};

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — Copy */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8"
              style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', color: '#3B82F6' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-refinex-success inline-block" />
              Advisory signals · Preview mode
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
              <Link href="/pricing"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white transition-all"
                style={{ background: '#2563EB' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#1D4ED8')}
                onMouseLeave={e => (e.currentTarget.style.background = '#2563EB')}>
                Get API access
              </Link>
              <Link href="/transparency"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#94A3B8' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.24)'; e.currentTarget.style.color = '#F8FAFC'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#94A3B8'; }}>
                View live signals →
              </Link>
            </div>
          </div>

          {/* Right — Signal Card */}
          <div className="relative">
            <div className="rounded-xl p-6" style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-refinex-muted">LIVE SIGNAL</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-refinex-success inline-block animate-pulse" />
                  LIVE
                </span>
              </div>
              <div className="space-y-3 font-mono text-sm">
                {[
                  ['signal_id', SAMPLE_SIGNAL.signal_id, '#94A3B8'],
                  ['region', SAMPLE_SIGNAL.region, '#F8FAFC'],
                  ['instance', SAMPLE_SIGNAL.instance, '#F8FAFC'],
                  ['confidence', SAMPLE_SIGNAL.confidence, '#10B981'],
                  ['regime', SAMPLE_SIGNAL.regime, '#3B82F6'],
                  ['spot_savings', SAMPLE_SIGNAL.spot_savings, '#10B981'],
                  ['suppressed', 'false', '#F59E0B'],
                ].map(([key, val, color]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-refinex-muted">{key}</span>
                    <span style={{ color }}>{val}</span>
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
  );
}
