import HeroSection from '@/components/sections/HeroSection'
import IntegrationBar from '@/components/IntegrationBar'
import FeaturesSection from '@/components/sections/FeaturesSection'
import HowItWorksSection from '@/components/sections/HowItWorksSection'
import QuickstartSection from '@/components/sections/QuickstartSection'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <IntegrationBar />
      <FeaturesSection />
      <HowItWorksSection />
      <QuickstartSection />

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-refinex-primary mb-6">
            Ready to Reduce Compute Waste?
          </h2>
          <p className="text-xl text-refinex-secondary mb-8">
            Start with our free tier. No cloud credentials required.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/docs/quickstart"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white transition-all"
              style={{ background: '#2563EB' }}>
              Get Started
            </Link>
            <Link href="/api-reference"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#94A3B8' }}>
              View API Docs
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
