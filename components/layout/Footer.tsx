import Link from 'next/link';

const XIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

const socialLinks = [
  { href: 'https://x.com/getrefinex', label: 'RefineX on X', Icon: XIcon },
  { href: 'https://www.linkedin.com/company/getrefinex', label: 'RefineX on LinkedIn', Icon: LinkedInIcon },
  { href: 'https://github.com/keithrawlingsbrown', label: 'RefineX on GitHub', Icon: GitHubIcon },
];

export default function Footer() {
  return (
    <footer className="py-12 px-6 section-divider">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">

          {/* Brand + socials */}
          <div className="max-w-xs">
            <p className="text-refinex-primary font-bold text-lg mb-2">RefineX</p>
            <p className="text-refinex-muted text-sm mb-5">
              Cloud signal intelligence for DevOps engineers and FinOps teams.
            </p>
            <div className="flex items-center gap-2">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-white transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          <div className="flex gap-12 flex-wrap">
            <div>
              <p className="text-refinex-secondary text-xs font-semibold uppercase tracking-widest mb-3">Product</p>
              <div className="flex flex-col gap-2">
                <Link href="/portal" className="text-refinex-muted hover:text-refinex-primary text-sm transition-colors">Get API Key</Link>
                <Link href="/pricing" className="text-refinex-muted hover:text-refinex-primary text-sm transition-colors">Pricing</Link>
                <Link href="/transparency" className="text-refinex-muted hover:text-refinex-primary text-sm transition-colors">Signal Transparency</Link>
                <Link href="/api-reference" className="text-refinex-muted hover:text-refinex-primary text-sm transition-colors">API Reference</Link>
                <Link href="/docs" className="text-refinex-muted hover:text-refinex-primary text-sm transition-colors">Docs</Link>
              </div>
            </div>
            <div>
              <p className="text-refinex-secondary text-xs font-semibold uppercase tracking-widest mb-3">Company</p>
              <div className="flex flex-col gap-2">
                <Link href="/blog" className="text-refinex-muted hover:text-refinex-primary text-sm transition-colors">Blog</Link>
                <Link href="/enterprise" className="text-refinex-muted hover:text-refinex-primary text-sm transition-colors">Enterprise</Link>
                <a href="mailto:keith@getrefinex.com" className="text-refinex-muted hover:text-refinex-primary text-sm transition-colors">Contact</a>
                <a href="https://x.com/getrefinex" target="_blank" rel="noopener noreferrer" className="text-refinex-muted hover:text-refinex-primary text-sm transition-colors">@getrefinex</a>
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

        {/* Bottom bar */}
        <div className="mt-12 pt-8 section-divider flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-refinex-muted text-sm">© 2026 RefineX. 1300 South Columbus Blvd. Ste. 1, Philadelphia, PA 19147</p>
          <div className="flex items-center gap-5">
            <p className="text-refinex-muted text-xs">Advisory signals only. Not financial or infrastructure advice.</p>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ href, label, Icon }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="text-slate-600 hover:text-slate-400 transition-colors">
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
