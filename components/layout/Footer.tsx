import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-12 px-6 section-divider">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <p className="text-refinex-primary font-bold text-lg mb-2">RefineX</p>
            <p className="text-refinex-muted text-sm max-w-xs">
              Advisory spot market signals for cloud engineers and FinOps teams.
            </p>
          </div>
          <div className="flex gap-12">
            <div>
              <p className="text-refinex-secondary text-xs font-semibold uppercase tracking-widest mb-3">Product</p>
              <div className="flex flex-col gap-2">
                <Link href="/pricing" className="text-refinex-muted hover:text-refinex-primary text-sm transition-colors">Pricing</Link>
                <Link href="/transparency" className="text-refinex-muted hover:text-refinex-primary text-sm transition-colors">Signal Transparency</Link>
                <Link href="/api-reference" className="text-refinex-muted hover:text-refinex-primary text-sm transition-colors">API Reference</Link>
              </div>
            </div>
            <div>
              <p className="text-refinex-secondary text-xs font-semibold uppercase tracking-widest mb-3">Legal</p>
              <div className="flex flex-col gap-2">
                <Link href="/privacy" className="text-refinex-muted hover:text-refinex-primary text-sm transition-colors">Privacy</Link>
                <Link href="/terms" className="text-refinex-muted hover:text-refinex-primary text-sm transition-colors">Terms</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 section-divider flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-refinex-muted text-sm">© 2026 RefineX. All rights reserved.</p>
          <p className="text-refinex-muted text-xs">Advisory signals only. Not financial or infrastructure advice.</p>
        </div>
      </div>
    </footer>
  );
}
