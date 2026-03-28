export const revalidate = 60

import HeroSection from '@/components/sections/HeroSection'
import IntegrationBar from '@/components/IntegrationBar'
import FeaturesSection from '@/components/sections/FeaturesSection'
import HowItWorksSection from '@/components/sections/HowItWorksSection'
import QuickstartSection from '@/components/sections/QuickstartSection'
import DeveloperToolsSection from '@/components/sections/DeveloperToolsSection'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <IntegrationBar />
      <FeaturesSection />
      <HowItWorksSection />
      <QuickstartSection />
      <DeveloperToolsSection />

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-refinex-primary mb-6">
            Ready to Reduce Compute Waste?
          </h2>
          <p className="text-xl text-refinex-secondary mb-8">
            Full API access, free for 90 days. No credit card. No cloud credentials required.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/docs/quickstart"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold btn-blue">
              Start free — 90 days
            </Link>
            <Link href="/api-reference"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold btn-outline-subtle">
              View API Docs
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
