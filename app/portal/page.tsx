'use client';

import { useState } from 'react';

export default function PortalPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(
        `https://refinex-api.onrender.com/v1/portal/signup`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Something went wrong');
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6"
        style={{ background: '#0A0F1E' }}>
        <div className="max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <span style={{ color: '#10B981', fontSize: '20px' }}>&#10003;</span>
          </div>
          <h1 className="text-2xl font-bold text-refinex-primary mb-3">Check your email</h1>
          <p className="text-refinex-secondary">
            We sent an access link to <strong className="text-refinex-primary">{email}</strong>.
            It expires in 24 hours.
          </p>
          <p className="text-refinex-muted text-sm mt-6">No email? Check spam or try again.</p>
          <button onClick={() => setSubmitted(false)}
            className="text-sm mt-2 transition-colors"
            style={{ color: '#3B82F6' }}>
            Try a different email
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6"
      style={{ background: '#0A0F1E' }}>
      <div className="max-w-md w-full">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-refinex-primary mb-3">
            Get API access
          </h1>
          <p className="text-refinex-secondary">
            Enter your email. We will send you a link to your dashboard.
            No password required.
          </p>
        </div>

        <div className="rounded-xl p-8 card-border" style={{ background: '#0F172A' }}>
          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-refinex-secondary mb-2">
              Work email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full px-4 py-3 rounded-lg text-refinex-primary placeholder-refinex-muted outline-none transition-all mb-4"
              style={{
                background: '#0A0F1E',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onFocus={e => (e.target.style.borderColor = '#2563EB')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
            />
            {error && (
              <p className="text-sm mb-4" style={{ color: '#EF4444' }}>{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-white transition-all"
              style={{ background: loading ? '#1D4ED8' : '#2563EB' }}>
              {loading ? 'Sending...' : 'Send access link \u2192'}
            </button>
          </form>
          <p className="text-refinex-muted text-xs text-center mt-6">
            Free sandbox access. No credit card required.
          </p>
        </div>
      </div>
    </main>
  );
}
