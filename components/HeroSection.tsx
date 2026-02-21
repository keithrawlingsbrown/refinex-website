'use client'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import CodeBlock from '@/components/ui/CodeBlock'
import GridBackground from '@/components/ui/GridBackground'
import Link from 'next/link'

const exampleCode = `curl -H "X-API-Key: rx_live_****" \\
  "https://api.refinex.io/v1/signals/active?cloud=aws&region=us-east-1&instance_type=c7g.xlarge"

{
  "action": "buy_spot",
  "signal": {
    "type": "spot_arbitrage",
    "confidence": 0.94,
    "current_spot_price": 0.0425,
    "on_demand_price": 0.1445,
    "expected_value": {
      "savings_percent": 70.6,
      "savings_usd_per_hour": 0.102
    },
    "ttl": 900,
    "expires_at": "2026-01-29T16:45:00Z"
  }
}`

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
      <GridBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Spot Instance Arbitrage Signals for Autoscalers
            </h1>
            
            <p className="text-xl text-refinex-gray-100 mb-8 leading-relaxed">
              Cut compute spend with short-lived, machine-readable signals. Updated approximately every 5 minutes, designed to expire by default (~15-minute TTL) to reduce stale decisions.
            </p>

            <ul className="space-y-3 mb-8 text-refinex-gray-100">
              <li className="flex items-center gap-3">
                <span className="text-refinex-cyan">✓</span>
                <span>API-only (no dashboard required)</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-refinex-cyan">✓</span>
                <span>No cloud credentials required</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-refinex-cyan">✓</span>
                <span>Read-only signals (you control execution)</span>
              </li>
            </ul>

            <div className="flex flex-wrap gap-4">
              <Link href="/docs/quickstart">
                <Button size="lg">Get Started Free</Button>
              </Link>
              <Link href="/api-reference">
                <Button variant="outline" size="lg">View API Docs</Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 flex items-center gap-6 text-sm text-refinex-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-semantic-success rounded-full animate-pulse" />
                <span>Updated ~every 5 min</span>
              </div>
              <div className="flex items-center gap-2">
                <span>10 signals free/month</span>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="mt-6 text-xs text-refinex-gray-100 opacity-75 max-w-xl">
              Spot pricing can be significantly lower than on-demand. Actual savings depend on workload, region, instance type, and your fallback strategy.
            </p>
          </motion.div>

          {/* Right: Code Example */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <CodeBlock
              code={exampleCode}
              language="bash"
              filename="Example: Fetch active signal"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
