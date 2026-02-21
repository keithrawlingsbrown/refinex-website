import { Metadata } from 'next'
import Card from '@/components/ui/Card'
import CodeBlock from '@/components/ui/CodeBlock'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Quickstart - RefineX Docs',
  description: 'Get started with RefineX in 5 minutes',
}

const step1Code = `# Get your API key from https://refinex.io/enterprise
export REFINEX_API_KEY="sk_live_..."`

const step2Code = `curl -H "X-API-Key: $REFINEX_API_KEY" \\
  "https://api.refinex.io/v1/health"

# Response
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-01-28T12:00:00Z"
}`

const step3Code = `curl -H "X-API-Key: $REFINEX_API_KEY" \\
  "https://api.refinex.io/v1/signals/active?cloud=aws&region=us-east-1&instance_type=c7g.xlarge"

# Response
{
  "action": "buy_spot",
  "signal": {
    "type": "spot_arbitrage",
    "confidence": 0.94,
    "expected_value": {
      "savings_percent": 70.6,
      "savings_usd_per_hour": 0.102
    },
    "ttl": 600
  }
}`

export default function QuickstartPage() {
  return (
    <div className="relative min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Quickstart</h1>
          <p className="text-xl text-refinex-gray-100 opacity-80">
            Get running with RefineX in 5 minutes.
          </p>
        </div>

        {/* Step 1 */}
        <Card className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-refinex-cyan text-refinex-navy font-bold">
              1
            </div>
            <h2 className="text-2xl font-bold">Get your API key</h2>
          </div>
          <p className="text-refinex-gray-100 opacity-80 mb-4">
            Request an API key through our enterprise form. You&apos;ll receive your key within 24 hours.
          </p>
          <Link href="/enterprise">
            <Button variant="outline">Request API Key</Button>
          </Link>
          <div className="mt-6">
            <CodeBlock code={step1Code} language="bash" />
          </div>
        </Card>

        {/* Step 2 */}
        <Card className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-refinex-cyan text-refinex-navy font-bold">
              2
            </div>
            <h2 className="text-2xl font-bold">Test your connection</h2>
          </div>
          <p className="text-refinex-gray-100 opacity-80 mb-4">
            Verify your API key works by calling the health endpoint.
          </p>
          <CodeBlock code={step2Code} language="bash" />
        </Card>

        {/* Step 3 */}
        <Card className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-refinex-cyan text-refinex-navy font-bold">
              3
            </div>
            <h2 className="text-2xl font-bold">Get your first signal</h2>
          </div>
          <p className="text-refinex-gray-100 opacity-80 mb-4">
            Request a signal for a specific instance type.
          </p>
          <CodeBlock code={step3Code} language="bash" />
        </Card>

        {/* Next Steps */}
        <Card>
          <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
          <ul className="space-y-3">
            <li>
              <Link href="/api-reference" className="text-refinex-cyan hover:underline">
                → Read the full API reference
              </Link>
            </li>
            <li>
              <Link href="/docs/authentication" className="text-refinex-cyan hover:underline">
                → Learn about authentication
              </Link>
            </li>
            <li>
              <Link href="/docs/integrations/kubernetes" className="text-refinex-cyan hover:underline">
                → Integrate with Kubernetes
              </Link>
            </li>
            <li>
              <Link href="/specs" className="text-refinex-cyan hover:underline">
                → Review technical specifications
              </Link>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
