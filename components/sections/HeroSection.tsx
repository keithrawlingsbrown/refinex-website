'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import GridBackground from '@/components/ui/GridBackground'
import CodeBlock from '@/components/ui/CodeBlock'

const exampleCode = `curl -H "X-API-Key: sk_live_..." \\
  https://api.refinex.io/v1/signals/active\\?cloud=aws\\&region=us-east-1\\&instance_type=c7g.xlarge

{
  "action": "buy_spot",
  "signal": {
    "type": "spot_arbitrage",
    "confidence": 0.94,
    "expected_value": {
      "savings_percent": 70.6,
      "savings_usd_per_hour": 0.102
    }
  }
}`

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <GridBackground />
      
      <div className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-refinex-cyan/10 border border-refinex-cyan/20 text-sm text-refinex-cyan mb-6">
              <div className="w-2 h-2 rounded-full bg-refinex-cyan animate-pulse-glow" />
              <span>API-Only • No Credentials Required</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Spot Instance{' '}
              <span className="gradient-text">Arbitrage Signals</span>{' '}
              for Autoscalers
            </h1>
            
            <p className="text-xl text-refinex-gray-100 opacity-80 mb-8 leading-relaxed">
              60-90% cost savings on cloud compute. Real-time signals updated every 5 minutes. 
              Built for Kubernetes HPA, CI/CD systems, and batch schedulers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/enterprise">
                <Button size="lg">
                  Get API Key
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button size="lg" variant="outline">
                  View Documentation
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 text-sm text-refinex-gray-100 opacity-60">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-refinex-cyan" />
                <span>Read-only API</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-refinex-cyan" />
                <span>No cloud credentials</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-refinex-cyan" />
                <span>5-minute updates</span>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Code Example */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <CodeBlock code={exampleCode} language="bash" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
