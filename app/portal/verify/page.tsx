'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function VerifyContent() {
  const params = useSearchParams();
  const token = params.get('token');
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    if (!token) { setState('error'); return; }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/portal/verify?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.detail) { setState('error'); return; }
        setData(d);
        setState('success');
      })
      .catch(() => setState('error'));
  }, [token]);

  function copyKey(key: string) {
    navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  }

  if (state === 'loading') return (
    <main className="min-h-screen flex items-center justify-center"
      style={{ background: '#0A0F1E' }}>
      <p className="text-refinex-secondary">Verifying your access...</p>
    </main>
  );

  if (state === 'error') return (
    <main className="min-h-screen flex items-center justify-center px-6"
      style={{ background: '#0A0F1E' }}>
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-refinex-primary mb-3">Link expired</h1>
        <p className="text-refinex-secondary mb-6">
          This link has expired or is invalid. Request a new one.
        </p>
        <a href="/portal"
          className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-white"
          style={{ background: '#2563EB' }}>
          Get new link
        </a>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen px-6 py-24" style={{ background: '#0A0F1E' }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <p className="text-refinex-muted text-sm mb-1">Signed in as</p>
          <h1 className="text-2xl font-bold text-refinex-primary">{data?.email}</h1>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold mt-2"
            style={{ background: 'rgba(37,99,235,0.15)', color: '#3B82F6',
                     border: '1px solid rgba(37,99,235,0.3)' }}>
            Tier {data?.tier} &middot; Sandbox access
          </span>
        </div>

        {/* API Keys */}
        <div className="rounded-xl p-6 mb-6 card-border" style={{ background: '#0F172A' }}>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-refinex-muted mb-4">
            Your API Keys
          </h2>
          {data?.api_keys?.map((k: any) => (
            <div key={k.key} className="mb-4 last:mb-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-refinex-primary text-sm font-medium">{k.name}</span>
                <span className="text-xs px-2 py-0.5 rounded"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8' }}>
                  {k.environment}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <code className="flex-1 text-xs font-mono text-refinex-muted bg-black/30
                                 px-3 py-2 rounded truncate">
                  {k.key}
                </code>
                <button onClick={() => copyKey(k.key)}
                  className="text-xs px-3 py-2 rounded transition-colors flex-shrink-0"
                  style={{ background: copied === k.key ? 'rgba(16,185,129,0.15)' : 'rgba(37,99,235,0.15)',
                           color: copied === k.key ? '#10B981' : '#3B82F6',
                           border: `1px solid ${copied === k.key ? 'rgba(16,185,129,0.3)' : 'rgba(37,99,235,0.3)'}` }}>
                  {copied === k.key ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Start */}
        <div className="rounded-xl p-6 card-border" style={{ background: '#0F172A' }}>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-refinex-muted mb-4">
            Quick Start
          </h2>
          <pre className="text-xs font-mono text-refinex-secondary overflow-x-auto"
            style={{ background: '#0A0F1E', padding: '16px', borderRadius: '8px' }}>
{`curl https://api.refinex.io/v1/signals/active \\
  -H "X-API-Key: ${data?.api_keys?.[0]?.key || 'your_key_here'}"`}
          </pre>
          <div className="mt-4 flex gap-3">
            <a href="/docs" className="text-sm transition-colors" style={{ color: '#3B82F6' }}>
              Read the docs &rarr;
            </a>
            <a href="/transparency" className="text-sm transition-colors" style={{ color: '#94A3B8' }}>
              View live signals &rarr;
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}
