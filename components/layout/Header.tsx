'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const navigation = [
  { name: 'Docs', href: '/docs' },
  { name: 'API Reference', href: '/api-reference' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Transparency', href: '/transparency' },
]

export default function Header() {
  const pathname = usePathname()
  const [status, setStatus] = useState<'ok' | 'degraded' | 'loading'>('loading')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/health')
        if (res.ok) {
          const data = await res.json()
          setStatus(data.ok ? 'ok' : 'degraded')
        } else {
          setStatus('degraded')
        }
      } catch {
        setStatus('degraded')
      }
    }
    checkHealth()
    const interval = setInterval(checkHealth, 60_000)
    return () => clearInterval(interval)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const statusColor = status === 'ok' ? '#10B981' : status === 'degraded' ? '#F59E0B' : '#475569'

  return (
    <header className="sticky top-0 z-50"
      style={{ background: 'rgba(10,15,30,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}>
      <nav className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-lg font-bold text-refinex-primary">RefineX</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium transition-colors"
                style={{
                  color: pathname === item.href ? '#F8FAFC' : '#475569',
                }}
                onMouseEnter={e => { if (pathname !== item.href) e.currentTarget.style.color = '#94A3B8' }}
                onMouseLeave={e => { if (pathname !== item.href) e.currentTarget.style.color = '#475569' }}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop: status + CTA */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: statusColor }} />
              <span style={{ color: '#475569' }}>
                {status === 'ok' ? 'All systems operational' : status === 'degraded' ? 'Degraded' : '...'}
              </span>
            </div>
            <Link href="/portal"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
              style={{ background: '#2563EB' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#1D4ED8')}
              onMouseLeave={e => (e.currentTarget.style.background = '#2563EB')}>
              Get API Key
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-refinex-muted"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile dropdown */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 rounded-lg"
            style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex flex-col py-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 text-sm font-medium transition-colors"
                  style={{
                    color: pathname === item.href ? '#F8FAFC' : '#94A3B8',
                    background: pathname === item.href ? 'rgba(37,99,235,0.1)' : 'transparent',
                  }}
                >
                  {item.name}
                </Link>
              ))}
              <div className="px-4 pt-3 mt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <Link href="/portal"
                  onClick={() => setIsOpen(false)}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
                  style={{ background: '#2563EB' }}>
                  Get API Key
                </Link>
              </div>
              <div className="px-4 pt-3">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: statusColor }} />
                  <span style={{ color: '#475569' }}>
                    {status === 'ok' ? 'All systems operational' : status === 'degraded' ? 'Degraded' : '...'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
