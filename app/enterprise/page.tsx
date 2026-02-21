import { Metadata } from 'next'
import Card from '@/components/ui/Card'
import EnterpriseForm from '@/components/forms/EnterpriseForm'

export const metadata: Metadata = {
  title: 'Enterprise - RefineX',
  description: 'Get API key and enterprise support for RefineX',
}

export default function EnterprisePage() {
  return (
    <div className="relative min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Enterprise</h1>
          <p className="text-xl text-refinex-gray-100 opacity-80 max-w-2xl mx-auto">
            RefineX works best for teams spending at scale. Tell us about your infrastructure 
            and we&apos;ll reach out.
          </p>
        </div>

        {/* Form */}
        <Card className="max-w-2xl mx-auto">
          <EnterpriseForm />
        </Card>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <p className="text-sm text-refinex-gray-100 opacity-60 mb-4">
            Trusted by infrastructure teams at scale
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-refinex-gray-100 opacity-40">
            <span>• 24-hour response time</span>
            <span>• No cloud credentials required</span>
            <span>• SOC 2 Type II (in progress)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
