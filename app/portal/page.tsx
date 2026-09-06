export const metadata = {
  title: 'Get API Access — RefineX',
  description: 'Sign-up is not currently available.',
};

export default function PortalPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6"
      style={{ background: '#0A0F1E' }}>
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-refinex-primary mb-3">Not currently available</h1>
        <p className="text-refinex-secondary">
          RefineX is not currently offered publicly, at any tier — including free. We&apos;re
          not accepting sign-ups right now. Check refinex.io for updates.
        </p>
      </div>
    </main>
  );
}
