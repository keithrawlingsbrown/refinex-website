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

          {/* Navigation */}
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

          {/* Right side: status + CTA */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: statusColor }} />
              <span style={{ color: '#475569' }}>
                {status === 'ok' ? 'All systems operational' : status === 'degraded' ? 'Degraded' : '...'}
              </span>
            </div>
            <Link href="/pricing"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
              style={{ background: '#2563EB' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#1D4ED8')}
              onMouseLeave={e => (e.currentTarget.style.background = '#2563EB')}>
              Get API Key
            </Link>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 text-refinex-muted">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  )
}
