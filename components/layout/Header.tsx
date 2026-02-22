'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Logo from '@/components/ui/Logo'

const navigation = [
  { name: 'Docs', href: '/docs' },
  { name: 'API Reference', href: '/api-reference' },
  { name: 'Technical Specs', href: '/specs' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Enterprise', href: '/enterprise' },
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-refinex-cyan/10 bg-refinex-navy/95 backdrop-blur-sm">
      <nav className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Logo className="h-8 w-8" />
            <span className="text-xl font-bold gradient-text">RefineX</span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors relative link-underline',
                  pathname === item.href
                    ? 'text-refinex-cyan'
                    : 'text-refinex-gray-100 hover:text-refinex-cyan'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:block">
            <Link href="/enterprise">
              <Button size="sm">Get API Key</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 text-refinex-cyan">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  )
}
