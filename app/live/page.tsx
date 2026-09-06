export const metadata = {
  title: 'Live Signal — RefineX',
  description: 'Public signal access is temporarily unavailable.',
};

export default function LivePage() {
  return (
    <main className="min-h-screen px-6 py-24" style={{ background: '#0A0F1E' }}>
      <div className="max-w-2xl mx-auto text-center">

        <span
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
          style={{ background: 'rgba(148,163,184,0.12)', border: '1px solid rgba(148,163,184,0.3)', color: '#94A3B8' }}
        >
          Not currently available
        </span>

        <h1 className="text-3xl font-bold mb-4" style={{ color: '#F1F5F9' }}>
          Live signal demo
        </h1>
        <p style={{ color: '#64748B' }} className="text-sm mb-2">
          RefineX is not currently offered publicly, at any tier — including this demo.
        </p>
        <p style={{ color: '#64748B' }} className="text-sm">
          Check back later, or see{' '}
          <a href="/transparency" style={{ color: '#3B82F6' }} className="underline">
            the transparency page
          </a>{' '}
          for updates.
        </p>

      </div>
    </main>
  );
}
