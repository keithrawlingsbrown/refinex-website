import HeroSection from '@/components/sections/HeroSection'
import LiveMetricsSection from '@/components/sections/LiveMetricsSection'
import FeaturesSection from '@/components/sections/FeaturesSection'
import HowItWorksSection from '@/components/sections/HowItWorksSection'
import QuickstartSection from '@/components/sections/QuickstartSection'
import Button from '@/components/ui/Button'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-hero">
      <HeroSection />
      <LiveMetricsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <QuickstartSection />
      
      {/* Pricing Preview Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Simple Pricing for Infrastructure Teams
            </h2>
            <p className="text-xl text-refinex-gray-100">
              Start free. Upgrade when you need production volume and support.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {/* Free */}
            <div className="bg-refinex-navy-light border border-refinex-cyan/20 rounded-lg p-6 hover:border-refinex-cyan/50 transition-all">
              <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
              <div className="text-3xl font-bold gradient-text mb-4">$0</div>
              <p className="text-refinex-gray-100 text-sm mb-4">10 signals/month</p>
              <ul className="space-y-2 text-sm text-refinex-gray-100 mb-6">
                <li>✓ Community docs</li>
                <li>✓ Standard rate limits</li>
              </ul>
              <Link href="/pricing">
                <Button variant="outline" className="w-full">Start Free</Button>
              </Link>
            </div>

            {/* Starter */}
            <div className="bg-refinex-navy-light border border-refinex-cyan/20 rounded-lg p-6 hover:border-refinex-cyan/50 transition-all">
              <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
              <div className="text-3xl font-bold gradient-text mb-4">$149<span className="text-lg">/mo</span></div>
              <p className="text-refinex-gray-100 text-sm mb-4">+ $0.10/signal</p>
              <ul className="space-y-2 text-sm text-refinex-gray-100 mb-6">
                <li>✓ Priority support</li>
                <li>✓ Higher rate limits</li>
              </ul>
              <Link href="/pricing">
                <Button variant="primary" className="w-full">Get Started</Button>
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-refinex-navy-light border border-refinex-cyan/20 rounded-lg p-6 hover:border-refinex-cyan/50 transition-all">
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <div className="text-3xl font-bold gradient-text mb-4">$399<span className="text-lg">/mo</span></div>
              <p className="text-refinex-gray-100 text-sm mb-4">+ $0.08/signal</p>
              <ul className="space-y-2 text-sm text-refinex-gray-100 mb-6">
                <li>✓ Higher limits</li>
                <li>✓ Faster support</li>
              </ul>
              <Link href="/pricing">
                <Button variant="primary" className="w-full">Upgrade</Button>
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-refinex-navy-light border border-refinex-cyan/20 rounded-lg p-6 hover:border-refinex-cyan/50 transition-all">
              <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
              <div className="text-3xl font-bold gradient-text mb-4">Custom</div>
              <p className="text-refinex-gray-100 text-sm mb-4">Volume pricing</p>
              <ul className="space-y-2 text-sm text-refinex-gray-100 mb-6">
                <li>✓ Dedicated support</li>
                <li>✓ Optional SLA</li>
              </ul>
              <Link href="/enterprise">
                <Button variant="outline" className="w-full">Talk to Sales</Button>
              </Link>
            </div>
          </div>

          <p className="text-center text-sm text-refinex-gray-100 opacity-75">
            All pricing excludes your cloud provider costs. Signals are guidance — final execution is controlled by your infrastructure.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Reduce Compute Waste?
          </h2>
          <p className="text-xl text-refinex-gray-100 mb-8">
            Start with our free tier. No cloud credentials required.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/docs/quickstart">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/api-reference">
              <Button variant="outline" size="lg">View API Docs</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
