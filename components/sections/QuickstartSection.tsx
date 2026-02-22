'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import CodeBlock from '@/components/ui/CodeBlock'
import Button from '@/components/ui/Button'
import { BookOpen } from 'lucide-react'

const quickstartCode = `# Get single best action for autoscaler
curl -H "X-API-Key: sk_live_..." \\
  "https://api.refinex.io/v1/signals/active?cloud=aws&region=us-east-1&instance_type=c7g.xlarge"

# Response
{
  "action": "buy_spot",
  "signal": {
    "signal_id": "01956789-abcd-7000-8000-123456789abc",
    "type": "spot_arbitrage",
    "confidence": 0.94,
    "expected_value": {
      "savings_percent": 70.6,
      "savings_usd_per_hour": 0.102,
      "risk_adjusted_savings": 0.098
    },
    "ttl": 600,
    "expires_at": "2026-01-13T15:33:45Z"
  }
}`

export default function QuickstartSection() {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get started in minutes
          </h2>
          <p className="text-lg text-refinex-gray-100 opacity-80">
            One HTTP call. One decision. No complexity.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <CodeBlock code={quickstartCode} language="bash" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-8 flex justify-center gap-4"
        >
          <Link href="/docs">
            <Button variant="outline">
              <BookOpen className="w-4 h-4 mr-2" />
              Full Documentation
            </Button>
          </Link>
          <Link href="/api-reference">
            <Button variant="secondary">
              API Reference
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
