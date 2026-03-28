import Link from 'next/link'

const mcpConfig = `// ~/.claude/settings.json
{
  "mcpServers": {
    "refinex": {
      "command": "refinex-mcp",
      "env": { "REFINEX_API_KEY": "your-key" }
    }
  }
}`

const cliCode = `pip install refinex-cli

refinex now
# ┌────────────── BUY SPOT ──────────────┐
# │  Instance   c6i.xlarge               │
# │  Region     us-west-2b               │
# │  Spot       $0.0626/hr               │
# │  Discount   63.2%                    │
# │  Confidence 0.72                     │
# │  Suppressed 119 in last 6h           │
# └─────────────────────────────────────┘`

const restCode = `curl https://refinex-api.onrender.com/v1/signals/now
# No API key required`

type Tab = 'cli' | 'mcp' | 'rest'

const tabs: { id: Tab; label: string; sub: string }[] = [
  { id: 'cli',  label: 'Terminal',    sub: 'pip install refinex-cli' },
  { id: 'mcp',  label: 'Claude Code', sub: 'pip install refinex-mcp' },
  { id: 'rest', label: 'REST API',    sub: 'curl / HTTP' },
]

const codeMap: Record<Tab, string> = {
  cli:  cliCode,
  mcp:  mcpConfig,
  rest: restCode,
}

export default function DeveloperToolsSection() {
  return (
    <section className="py-20 section-divider">
      <div className="mx-auto max-w-5xl px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-refinex-primary mb-4">
            Three ways to consume
          </h2>
          <p className="text-lg text-refinex-secondary">
            Terminal, Claude Code, or raw HTTP. Same live AWS data. Same deterministic confidence scoring.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

          {/* CLI */}
          <div className="rounded-xl p-6 flex flex-col gap-4"
            style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⌨️</span>
              <div>
                <p className="font-semibold text-refinex-primary">Terminal</p>
                <p className="text-xs text-refinex-muted font-mono">refinex-cli</p>
              </div>
            </div>
            <p className="text-sm text-refinex-secondary flex-1">
              6 commands. Rich output. <code className="text-refinex-cyan">--json</code> flag for piping.
              <br /><br />
              <code className="text-refinex-cyan">refinex now</code> — zero credentials, live data.
            </p>
            <div className="rounded-lg px-3 py-2 font-mono text-xs text-refinex-cyan"
              style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
              pip install refinex-cli
            </div>
            <a href="https://pypi.org/project/refinex-cli/" target="_blank" rel="noopener noreferrer"
              className="text-xs text-refinex-muted hover:text-refinex-cyan transition-colors">
              PyPI → refinex-cli
            </a>
          </div>

          {/* MCP */}
          <div className="rounded-xl p-6 flex flex-col gap-4"
            style={{ background: '#0F172A', border: '1px solid rgba(6,182,212,0.25)' }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🤖</span>
              <div>
                <p className="font-semibold text-refinex-primary">Claude Code / Cursor</p>
                <p className="text-xs text-refinex-muted font-mono">refinex-mcp</p>
              </div>
            </div>
            <p className="text-sm text-refinex-secondary flex-1">
              6 MCP tools. Ask Claude for live spot data inside your editor — no browser, no dashboard.
              <br /><br />
              <code className="text-refinex-cyan">get_live_signal</code> needs no API key.
            </p>
            <div className="rounded-lg px-3 py-2 font-mono text-xs text-refinex-cyan"
              style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
              pip install refinex-mcp
            </div>
            <a href="https://pypi.org/project/refinex-mcp/" target="_blank" rel="noopener noreferrer"
              className="text-xs text-refinex-muted hover:text-refinex-cyan transition-colors">
              PyPI → refinex-mcp
            </a>
          </div>

          {/* REST */}
          <div className="rounded-xl p-6 flex flex-col gap-4"
            style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔗</span>
              <div>
                <p className="font-semibold text-refinex-primary">REST API</p>
                <p className="text-xs text-refinex-muted font-mono">curl / HTTP</p>
              </div>
            </div>
            <p className="text-sm text-refinex-secondary flex-1">
              One endpoint. No auth required for live signal.
              Wire directly into autoscalers, CI/CD, or Terraform.
              <br /><br />
              JSON response, deterministic confidence score.
            </p>
            <div className="rounded-lg px-3 py-2 font-mono text-xs text-refinex-cyan"
              style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
              curl .../v1/signals/now
            </div>
            <Link href="/api-reference"
              className="text-xs text-refinex-muted hover:text-refinex-cyan transition-colors">
              API Reference →
            </Link>
          </div>
        </div>

        {/* Code preview — CLI example */}
        <div className="rounded-xl overflow-hidden"
          style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 px-4 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="w-3 h-3 rounded-full" style={{ background: '#EF4444' }} />
            <span className="w-3 h-3 rounded-full" style={{ background: '#F59E0B' }} />
            <span className="w-3 h-3 rounded-full" style={{ background: '#10B981' }} />
            <span className="ml-2 text-xs text-refinex-muted font-mono">terminal — refinex now</span>
          </div>
          <pre className="p-6 overflow-x-auto text-sm font-mono leading-relaxed text-refinex-secondary">
{`$ refinex now

┌──────────────────── BUY SPOT ─────────────────────┐
│                                                    │
│   Cloud        AWS                                 │
│   Region       us-west-2  us-west-2b               │
│   Instance     c6i.xlarge                          │
│   Spot price   $0.0626/hr                          │
│   On-demand    $0.1700/hr                          │
│   Discount     63.2%                               │
│   Confidence   0.72                                │
│   TTL          28 min                              │
│   Suppressed   119 in last 6h                      │
│                                                    │
└────────────────────────────────────────────────────┘`}
          </pre>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <a href="https://github.com/keithrawlingsbrown/refinex-cli" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold btn-outline-subtle">
            refinex-cli on GitHub
          </a>
          <a href="https://github.com/keithrawlingsbrown/refinex-mcp" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold btn-outline-subtle">
            refinex-mcp on GitHub
          </a>
        </div>

      </div>
    </section>
  )
}
