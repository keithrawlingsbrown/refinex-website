'use client'
import { motion } from 'framer-motion'
import { Shield, Zap, Clock, Code, TrendingUp, Lock } from 'lucide-react'
import Card from '@/components/ui/Card'

const features = [
  {
    icon: Zap,
    title: 'Real-Time Signals',
    description: 'Spot price arbitrage opportunities detected and scored every 5 minutes across AWS, GCP, and Azure.',
  },
  {
    icon: Shield,
    title: 'No Cloud Credentials',
    description: 'Read-only API using public pricing data. Never requests, stores, or requires your cloud keys.',
  },
  {
    icon: TrendingUp,
    title: '60-90% Cost Savings',
    description: 'Confidence-scored signals help you achieve significant savings vs on-demand pricing.',
  },
  {
    icon: Code,
    title: 'API-First Design',
    description: 'Single HTTP call per decision. Built for Kubernetes HPA, Terraform, CI/CD, and batch schedulers.',
  },
  {
    icon: Clock,
    title: 'Fast & Fresh',
    description: 'p95 latency <200ms. Signals expire by design to prevent stale decisions.',
  },
  {
    icon: Lock,
    title: 'Enterprise Ready',
    description: 'Kill switches, circuit breakers, and safe-by-default failure modes built in.',
  },
]

export default function FeaturesSection() {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built like an <span className="gradient-text">infra primitive</span>
          </h2>
          <p className="text-lg text-refinex-gray-100 opacity-80 max-w-2xl mx-auto">
            RefineX is a read-only signals API designed for autoscalers and pipelines. 
            No cloud credentials required. Signals expire by design to prevent stale decisions.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card hover className="h-full">
                <feature.icon className="w-10 h-10 text-refinex-cyan mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-refinex-cyan">
                  {feature.title}
                </h3>
                <p className="text-refinex-gray-100 opacity-80">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
