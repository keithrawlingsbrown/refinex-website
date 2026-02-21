'use client'
import MetricCard from '@/components/ui/MetricCard'

export default function LiveMetricsSection() {
  return (
    <section className="py-20 px-6 bg-refinex-navy/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Current Market Snapshot
          </h2>
          <p className="text-refinex-gray-100">
            Example metrics from recent signal generation (illustrative)
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            value={347}
            label="Active Signals"
            animate
          />
          <MetricCard
            value={1247}
            label="Est. $/hr Opportunity"
            prefix="$"
            animate
          />
          <MetricCard
            value={68.4}
            label="Avg. Potential Savings"
            suffix="%"
            decimals={1}
            animate
          />
          <MetricCard
            value={0.89}
            label="Avg. Confidence"
            decimals={2}
            animate
          />
        </div>

        {/* Disclaimer */}
        <div className="bg-refinex-navy-light border border-refinex-cyan/20 rounded-lg p-6">
          <p className="text-sm text-refinex-gray-100 text-center">
            <strong className="text-white">Note:</strong> These are illustrative metrics based on public spot pricing data. Actual savings depend on your workload characteristics, region selection, instance type mix, and fallback strategy. RefineX provides recommendations — final execution decisions remain under your infrastructure&apos;s control.
          </p>
        </div>
      </div>
    </section>
  )
}
