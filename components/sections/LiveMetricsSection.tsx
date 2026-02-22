'use client'
import { motion } from 'framer-motion'
import MetricCard from '@/components/ui/MetricCard'

export default function LiveMetricsSection() {
  return (
    <section className="relative py-12 bg-refinex-navy-dark">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          <MetricCard value={347} label="Active Signals" />
          <MetricCard value={1247} label="USD/hour Saved" prefix="$" />
          <MetricCard value={68.4} label="Avg Savings" suffix="%" decimals={1} />
          <MetricCard value={94} label="Avg Confidence" suffix="%" />
        </motion.div>
      </div>
    </section>
  )
}
