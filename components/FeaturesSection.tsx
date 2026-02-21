'use client'
import { motion } from 'framer-motion'
import Card from '@/components/ui/Card'
import { Zap, Shield, TrendingUp, Code, Clock, Lock } from 'lucide-react'

const features = [
  {
    icon: Code,
    title: 'API-First Design',
    description: 'Single request → actionable signal payloads built for autoscalers, CI guardrails, and batch schedulers.',
  },
  {
    icon: Clock,
    title: 'Fast & Fresh',
    description: 'Targets low latency and short TTL by design. Signals expire automatically (~15 min) so your systems don\'t act on stale conditions.',
  },
  {
    icon: Shield,
    title: 'Safety by Default',
    description: 'Kill switches, admin gating, and conservative defaults. RefineX provides recommendations — you decide how to apply them.',
  },
  {
    icon: Lock,
    title: 'No Credentials Required',
    description: 'Consumes only public pricing data. You never share cloud credentials or workload information with RefineX.',
  },
  {
    icon: TrendingUp,
    title: 'Confidence Scoring',
    description: 'Every signal includes a confidence score (0-1) based on historical stability, market depth, and volatility analysis.',
  },
  {
    icon: Zap,
    title: 'Updated Frequently',
    description: 'Ingests spot prices approximately every 5 minutes. Signals recalculate continuously as new market data arrives.',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Built for Infrastructure Teams
          </h2>
          <p className="text-xl text-refinex-gray-100 max-w-3xl mx-auto">
            Machine-readable signals designed to integrate with existing autoscaling and capacity management systems.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 h-full" hover>
                <feature.icon className="w-8 h-8 text-refinex-cyan mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-refinex-gray-100 leading-relaxed">
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
