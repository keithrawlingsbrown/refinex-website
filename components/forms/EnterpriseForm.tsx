'use client'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import { CheckCircle } from 'lucide-react'

export default function EnterpriseForm() {
  const [formData, setFormData] = useState({
    companyName: '',
    role: '',
    email: '',
    cloudProviders: '',
    monthlySpend: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/enterprise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitted(true)
      }
    } catch (error) {
      console.error('Form submission failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-semantic-success mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Thank you!</h3>
        <p className="text-refinex-gray-100 opacity-80">
          We&apos;ll review your request and reach out within 24 hours.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="companyName" className="block text-sm font-medium mb-2">
          Company name
        </label>
        <input
          type="text"
          id="companyName"
          name="companyName"
          required
          value={formData.companyName}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg bg-refinex-navy border border-refinex-cyan/20 focus:border-refinex-cyan/50 focus:outline-none transition-colors"
          placeholder="Acme Inc"
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium mb-2">
          Role / Title
        </label>
        <input
          type="text"
          id="role"
          name="role"
          required
          value={formData.role}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg bg-refinex-navy border border-refinex-cyan/20 focus:border-refinex-cyan/50 focus:outline-none transition-colors"
          placeholder="Engineering Manager"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg bg-refinex-navy border border-refinex-cyan/20 focus:border-refinex-cyan/50 focus:outline-none transition-colors"
          placeholder="you@company.com"
        />
      </div>

      <div>
        <label htmlFor="cloudProviders" className="block text-sm font-medium mb-2">
          Cloud provider(s)
        </label>
        <select
          id="cloudProviders"
          name="cloudProviders"
          required
          value={formData.cloudProviders}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg bg-refinex-navy border border-refinex-cyan/20 focus:border-refinex-cyan/50 focus:outline-none transition-colors"
        >
          <option value="">Select providers</option>
          <option value="aws">AWS only</option>
          <option value="gcp">GCP only</option>
          <option value="azure">Azure only</option>
          <option value="aws_gcp">AWS + GCP</option>
          <option value="aws_azure">AWS + Azure</option>
          <option value="gcp_azure">GCP + Azure</option>
          <option value="all">All three</option>
        </select>
      </div>

      <div>
        <label htmlFor="monthlySpend" className="block text-sm font-medium mb-2">
          Monthly infra spend
        </label>
        <select
          id="monthlySpend"
          name="monthlySpend"
          required
          value={formData.monthlySpend}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg bg-refinex-navy border border-refinex-cyan/20 focus:border-refinex-cyan/50 focus:outline-none transition-colors"
        >
          <option value="">Select range</option>
          <option value="<10k">&lt; $10k</option>
          <option value="10k-50k">$10k - $50k</option>
          <option value="50k-250k">$50k - $250k</option>
          <option value="250k-1m">$250k - $1M</option>
          <option value=">1m">&gt; $1M</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-2">
          What are you trying to optimize?
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={formData.message}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg bg-refinex-navy border border-refinex-cyan/20 focus:border-refinex-cyan/50 focus:outline-none transition-colors resize-none"
          placeholder="Tell us about your infrastructure and cost optimization goals..."
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Submitting...' : 'Submit Request'}
      </Button>

      <p className="text-xs text-refinex-gray-100 opacity-60 text-center">
        By submitting, you agree to our Terms of Service and Privacy Policy
      </p>
    </form>
  )
}
