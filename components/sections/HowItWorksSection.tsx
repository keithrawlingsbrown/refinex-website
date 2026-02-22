'use client'
import { motion } from 'framer-motion'
import { Cloud, Database, Cpu, ArrowRight } from 'lucide-react'
import Card from '@/components/ui/Card'

const steps = [
  {
    icon: Cloud,
    title: 'Cloud APIs',
    description: 'AWS, GCP, Azure',
    detail: 'Public spot pricing data updated every 5 minutes',
  },
  {
    icon: Database,
    title: 'Detection Engine',
    description: 'RefineX Core',
    detail: 'Finds arbitrage opportunities, scores confidence',
  },
  {
    icon: Cpu,
    title: 'Your System',
    description: 'Kubernetes, CI/CD',
    detail: 'Consumes signals via simple REST API',
  },
]

export default function HowItWorksSection() {
  return (
    <section className="relative py-20 bg-refinex-navy-dark">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How it works
          </h2>
          <p className="text-lg text-refinex-gray-100 opacity-80 max-w-2xl mx-auto">
            Simple three-step pipeline from cloud APIs to your infrastructure decisions.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 items-center">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card hover className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-refinex-cyan/10 border border-refinex-cyan/30 mb-4">
                  <step.icon className="w-8 h-8 text-refinex-cyan" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-refinex-cyan text-sm mb-2">{step.description}</p>
                <p className="text-refinex-gray-100 opacity-70 text-sm">
                  {step.detail}
                </p>
              </Card>

              {/* Arrow between cards */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-8 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-12 h-12 text-refinex-cyan opacity-30" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex flex-col items-center gap-2 px-6 py-3 rounded-lg bg-refinex-navy-light border border-refinex-cyan/20">
            <p className="text-sm text-refinex-gray-100 opacity-60">Updates every</p>
            <p className="text-2xl font-bold gradient-text">5 minutes</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
