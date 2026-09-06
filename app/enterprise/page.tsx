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
            RefineX is not currently offered publicly, at any tier. You&apos;re welcome to tell
            us about your infrastructure below, but we don&apos;t have a follow-up process in
            place yet — please don&apos;t expect a response at this time.
          </p>
        </div>

        {/* Form */}
        <Card className="max-w-2xl mx-auto">
          <EnterpriseForm />
        </Card>
      </div>
    </div>
  )
}
