import Link from 'next/link'
import Logo from '@/components/ui/Logo'

const footerSections = [
  {
    title: 'Product',
    links: [
      { name: 'Pricing', href: '/pricing' },
      { name: 'Docs', href: '/docs' },
      { name: 'Technical Specs', href: '/specs' },
      { name: 'Enterprise', href: '/enterprise' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Trust',
    links: [
      { name: 'Status', href: 'https://status.refinex.io', external: true },
      { name: 'Security', href: '/security' },
      { name: 'Governance', href: '/governance' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Terms', href: '/terms' },
      { name: 'Privacy', href: '/privacy' },
      { name: 'Data Handling', href: '/data-handling' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-refinex-cyan/10 bg-refinex-navy-dark mt-20">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Logo className="h-8 w-8" />
              <span className="text-lg font-bold gradient-text">RefineX</span>
            </Link>
            <p className="text-sm text-refinex-gray-100 opacity-60">
              Spot instance arbitrage signals for infrastructure teams.
            </p>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-refinex-cyan mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-refinex-gray-100 hover:text-refinex-cyan transition-colors"
                      {...(link.external && {
                        target: '_blank',
                        rel: 'noopener noreferrer',
                      })}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-refinex-cyan/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-refinex-gray-100 opacity-60">
              © {new Date().getFullYear()} RefineX. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-refinex-gray-100 opacity-60">
              <span>Read-only signals</span>
              <span>•</span>
              <span>No cloud credentials</span>
              <span>•</span>
              <span>API-first</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
