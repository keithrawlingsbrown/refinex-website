import { Metadata } from 'next'
import Card from '@/components/ui/Card'
import CodeBlock from '@/components/ui/CodeBlock'
import SignalBadge from '@/components/ui/SignalBadge'

export const metadata: Metadata = {
  title: 'API Reference - RefineX',
  description: 'Complete API reference for RefineX spot arbitrage signals',
}

const endpoints = [
  {
    method: 'GET',
    path: '/v1/health',
    description: 'Liveness check',
  },
  {
    method: 'GET',
    path: '/v1/signals/active',
    description: 'Single best action (autoscaler-friendly)',
    primary: true,
  },
  {
    method: 'GET',
    path: '/v1/signals/summary',
    description: 'Aggregate view of current opportunities',
  },
  {
    method: 'GET',
    path: '/v1/signals',
    description: 'List all active signals (paginated)',
  },
]

const activeEndpointExample = `# Request
GET https://api.refinex.io/v1/signals/active?cloud=aws&region=us-east-1&instance_type=c7g.xlarge
X-API-Key: sk_live_...

# Response
{
  "action": "buy_spot",
  "signal": {
    "signal_id": "01956789-abcd-7000-8000-123456789abc",
    "type": "spot_arbitrage",
    "timestamp": "2026-01-13T15:23:45Z",
    "source": {
      "cloud": "aws",
      "region": "us-east-1",
      "availability_zone": "us-east-1a"
    },
    "asset": {
      "instance_type": "c7g.xlarge",
      "vcpu": 4,
      "memory_gb": 8,
      "current_spot_price": 0.0425,
      "on_demand_price": 0.1445
    },
    "action": "buy_spot",
    "expected_value": {
      "savings_percent": 70.6,
      "savings_usd_per_hour": 0.102,
      "risk_adjusted_savings": 0.098
    },
    "confidence": 0.94,
    "ttl": 600,
    "expires_at": "2026-01-13T15:33:45Z"
  },
  "alternatives": [
    {
      "availability_zone": "us-east-1b",
      "current_spot_price": 0.0445,
      "savings_percent": 69.2,
      "confidence": 0.91
    }
  ]
}`

const summaryEndpointExample = `# Request
GET https://api.refinex.io/v1/signals/summary?cloud=aws&min_savings=50&confidence_min=0.80
X-API-Key: sk_live_...

# Response
{
  "timestamp": "2026-01-13T15:30:00Z",
  "summary": {
    "total_signals": 347,
    "spot_arbitrage": 312,
    "interruption_risk": 35,
    "avg_savings_percent": 68.4,
    "avg_confidence": 0.87
  },
  "by_cloud": {
    "aws": {
      "signals": 201,
      "avg_savings_percent": 71.2,
      "top_instance_types": [
        {
          "instance_type": "c7g.xlarge",
          "signals": 45,
          "avg_savings": 70.6
        }
      ]
    }
  },
  "ttl": 300,
  "next_update": "2026-01-13T15:35:00Z"
}`

export default function APIReferencePage() {
  return (
    <div className="relative min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-20">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            API Reference
          </h1>
          <p className="text-xl text-refinex-gray-100 opacity-80 mb-6">
            Complete endpoint documentation for the RefineX signals API.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="px-4 py-2 rounded-lg bg-refinex-navy-light border border-refinex-cyan/20">
              <span className="text-sm text-refinex-gray-100 opacity-60">Base URL: </span>
              <code className="text-refinex-cyan">https://api.refinex.io</code>
            </div>
            <div className="px-4 py-2 rounded-lg bg-refinex-navy-light border border-refinex-cyan/20">
              <span className="text-sm text-refinex-gray-100 opacity-60">Auth: </span>
              <code className="text-refinex-cyan">X-API-Key header</code>
            </div>
          </div>
        </div>

        {/* Endpoints Overview */}
        <Card className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Endpoints</h2>
          <div className="space-y-4">
            {endpoints.map((endpoint) => (
              <div
                key={endpoint.path}
                className={`p-4 rounded-lg border transition-colors ${
                  endpoint.primary
                    ? 'border-refinex-cyan/40 bg-refinex-cyan/5'
                    : 'border-refinex-cyan/20'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="px-3 py-1 rounded-md bg-semantic-success text-refinex-navy text-sm font-mono font-semibold">
                      {endpoint.method}
                    </span>
                    <code className="text-refinex-cyan font-mono text-sm">
                      {endpoint.path}
                    </code>
                  </div>
                  <p className="text-refinex-gray-100 opacity-80 text-sm">
                    {endpoint.description}
                    {endpoint.primary && (
                      <span className="ml-2 text-refinex-cyan text-xs">
                        — Primary endpoint
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Signal Types */}
        <Card className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Signal Types</h2>
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-refinex-navy border border-refinex-cyan/20">
              <SignalBadge type="spot_arbitrage" confidence={0.94} className="mb-3" />
              <h3 className="text-lg font-semibold mb-2">Spot Arbitrage</h3>
              <p className="text-refinex-gray-100 opacity-80 mb-3">
                Spot price is significantly lower than on-demand (&gt;50% savings)
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-refinex-gray-100 opacity-60">Actions: </span>
                  <code className="text-semantic-success">buy_spot</code>,{' '}
                  <code>wait</code>,{' '}
                  <code>fallback_on_demand</code>
                </div>
                <div>
                  <span className="text-refinex-gray-100 opacity-60">TTL: </span>
                  <span className="text-refinex-cyan">600 seconds (10 min)</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-refinex-navy border border-refinex-cyan/20">
              <SignalBadge type="interruption_risk" confidence={0.87} className="mb-3" />
              <h3 className="text-lg font-semibold mb-2">Interruption Risk</h3>
              <p className="text-refinex-gray-100 opacity-80 mb-3">
                Spot instance likely to be interrupted soon (based on price volatility)
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-refinex-gray-100 opacity-60">Actions: </span>
                  <code className="text-semantic-warning">migrate_spot</code>,{' '}
                  <code>fallback_on_demand</code>,{' '}
                  <code>checkpoint_now</code>
                </div>
                <div>
                  <span className="text-refinex-gray-100 opacity-60">TTL: </span>
                  <span className="text-refinex-cyan">300 seconds (5 min)</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Primary Endpoint Detail */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">
            GET /v1/signals/active
          </h2>
          <p className="text-refinex-gray-100 opacity-80 mb-6">
            Returns the single best action for a specific cloud/region/instance_type combination. 
            Designed for autoscalers that want ONE answer: &quot;What should I do right now?&quot;
          </p>

          <h3 className="text-xl font-semibold mb-4">Parameters</h3>
          <Card className="mb-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <code className="text-refinex-cyan font-mono">cloud</code>
                <span className="text-sm text-refinex-gray-100 opacity-80">
                  <span className="text-semantic-warning">required</span> • string • 
                  Cloud provider (aws, gcp, azure)
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <code className="text-refinex-cyan font-mono">region</code>
                <span className="text-sm text-refinex-gray-100 opacity-80">
                  <span className="text-semantic-warning">required</span> • string • 
                  Region (e.g., us-east-1)
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <code className="text-refinex-cyan font-mono">instance_type</code>
                <span className="text-sm text-refinex-gray-100 opacity-80">
                  <span className="text-semantic-warning">required</span> • string • 
                  Instance type (e.g., c7g.xlarge)
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <code className="text-refinex-cyan font-mono">fallback</code>
                <span className="text-sm text-refinex-gray-100 opacity-80">
                  optional • string • on_demand | wait | none (default: on_demand)
                </span>
              </div>
            </div>
          </Card>

          <h3 className="text-xl font-semibold mb-4">Example</h3>
          <CodeBlock code={activeEndpointExample} language="bash" />
        </div>

        {/* Summary Endpoint */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">
            GET /v1/signals/summary
          </h2>
          <p className="text-refinex-gray-100 opacity-80 mb-6">
            Returns aggregate view of current opportunities. Useful for dashboards 
            and CI/CD systems that want to know &quot;How many good deals exist right now?&quot;
          </p>

          <h3 className="text-xl font-semibold mb-4">Example</h3>
          <CodeBlock code={summaryEndpointExample} language="bash" />
        </div>

        {/* Rate Limits */}
        <Card>
          <h2 className="text-2xl font-bold mb-4">Rate Limits</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-refinex-navy border border-refinex-cyan/20 text-center">
              <div className="text-3xl font-bold gradient-text mb-2">100</div>
              <div className="text-sm text-refinex-gray-100 opacity-60">Free tier</div>
              <div className="text-xs text-refinex-gray-100 opacity-40">requests/min</div>
            </div>
            <div className="p-4 rounded-lg bg-refinex-navy border border-refinex-cyan/20 text-center">
              <div className="text-3xl font-bold gradient-text mb-2">1000</div>
              <div className="text-sm text-refinex-gray-100 opacity-60">Starter</div>
              <div className="text-xs text-refinex-gray-100 opacity-40">requests/min</div>
            </div>
            <div className="p-4 rounded-lg bg-refinex-navy border border-refinex-cyan/20 text-center">
              <div className="text-3xl font-bold gradient-text mb-2">10K</div>
              <div className="text-sm text-refinex-gray-100 opacity-60">Pro</div>
              <div className="text-xs text-refinex-gray-100 opacity-40">requests/min</div>
            </div>
            <div className="p-4 rounded-lg bg-refinex-navy border border-refinex-cyan/20 text-center">
              <div className="text-3xl font-bold gradient-text mb-2">100K</div>
              <div className="text-sm text-refinex-gray-100 opacity-60">Enterprise</div>
              <div className="text-xs text-refinex-gray-100 opacity-40">requests/min</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
