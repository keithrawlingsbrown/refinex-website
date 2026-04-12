import { auth0 } from '@/lib/auth0'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = {
  title: 'Dashboard — RefineX',
  description: 'Manage your RefineX API keys, usage, and account settings.',
}

export default async function DashboardPage() {
  const session = await auth0.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const { user } = session

  return (
    <main className="min-h-screen px-6 py-24" style={{ background: '#0A0F1E' }}>
      <div className="max-w-3xl mx-auto">

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">
            Logged in as <span className="text-white font-medium">{user.email}</span>
          </p>
        </div>

        {/* Account Overview */}
        <div className="grid gap-6 mb-10">
          <div className="rounded-xl p-6" style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="text-lg font-semibold text-white mb-4">Account</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Name</span>
                <span className="text-white">{user.name || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email</span>
                <span className="text-white">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email Verified</span>
                <span className={user.email_verified ? 'text-green-400' : 'text-amber-400'}>
                  {user.email_verified ? 'Yes' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Plan</span>
                <span className="text-blue-400">Free Trial — 90 days</span>
              </div>
            </div>
          </div>

          {/* API Key Section */}
          <div className="rounded-xl p-6" style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="text-lg font-semibold text-white mb-4">API Access</h2>
            <p className="text-slate-400 text-sm mb-4">
              Your API key will be provisioned after account verification.
              Use it with the RefineX REST API, MCP server, or CLI tool.
            </p>
            <div className="flex gap-3">
              <Link href="/docs/quickstart"
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-blue-400 transition-all"
                style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' }}>
                Quickstart Guide
              </Link>
              <Link href="/api-reference"
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}>
                API Reference
              </Link>
            </div>
          </div>

          {/* Consent Preferences */}
          <div className="rounded-xl p-6" style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="text-lg font-semibold text-white mb-4">Privacy and Consent</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-white">Analytics Cookies</span>
                  <p className="text-slate-500 text-xs">PostHog pageview and session tracking</p>
                </div>
                <button className="termly-display-preferences text-blue-400 text-xs hover:text-blue-300">
                  Manage
                </button>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-white">Marketing Communications</span>
                  <p className="text-slate-500 text-xs">Product updates and signal reports</p>
                </div>
                <span className="text-slate-500 text-xs">Manage via email preferences</span>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="rounded-xl p-6" style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="text-lg font-semibold text-white mb-4">Account Actions</h2>
            <div className="flex flex-wrap gap-3">
              <a href="/auth/logout"
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-slate-400 transition-all hover:text-white"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                Log Out
              </a>
              <Link href="/contact"
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-red-400 transition-all hover:text-red-300"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                Request Account Deletion
              </Link>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}
