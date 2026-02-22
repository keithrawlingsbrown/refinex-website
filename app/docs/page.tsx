import Link from 'next/link'
import { BookOpen, Code, DollarSign, Shield, FileText } from 'lucide-react'
import Card from '@/components/ui/Card'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Documentation - RefineX',
  description: 'Complete documentation for the RefineX spot arbitrage signals API',
}

const docSections = [
  {
    icon: BookOpen,
    title: 'Quickstart',
    description: 'Get running in minutes.',
    href: '/docs/quickstart',
  },
  {
    icon: Code,
    title: 'API Overview',
    description: 'Machine-first API basics.',
    href: '/api-reference',
  },
  {
    icon: DollarSign,
    title: 'Pricing & Billing',
    description: 'Usage-based model details.',
    href: '/pricing',
  },
  {
    icon: Shield,
    title: 'Trust & Governance',
    description: 'Boundaries and guarantees.',
    href: '/docs/trust',
  },
  {
    icon: FileText,
    title: 'Technical Specs',
    description: 'YC-credible technical overview.',
    href: '/specs',
  },
]

export default function DocsPage() {
  return (
    <div className="relative min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-20">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Documentation
          </h1>
          <p className="text-xl text-refinex-gray-100 opacity-80">
            Documentation structure for infrastructure teams.
          </p>
        </div>

        {/* Doc Sections Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docSections.map((section) => (
            <Link key={section.title} href={section.href}>
              <Card hover className="h-full">
                <section.icon className="w-10 h-10 text-refinex-cyan mb-4" />
                <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
                <p className="text-refinex-gray-100 opacity-70">
                  {section.description}
                </p>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-16 p-8 rounded-lg bg-refinex-navy-light border border-refinex-cyan/20">
          <h2 className="text-2xl font-bold mb-6">Quick Links</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-refinex-cyan mb-3">
                Getting Started
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/docs/quickstart"
                    className="text-refinex-gray-100 hover:text-refinex-cyan transition-colors"
                  >
                    → Quickstart Guide
                  </Link>
                </li>
                <li>
                  <Link
                    href="/api-reference"
                    className="text-refinex-gray-100 hover:text-refinex-cyan transition-colors"
                  >
                    → API Reference
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs/authentication"
                    className="text-refinex-gray-100 hover:text-refinex-cyan transition-colors"
                  >
                    → Authentication
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-refinex-cyan mb-3">
                Integration Guides
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/docs/integrations/kubernetes"
                    className="text-refinex-gray-100 hover:text-refinex-cyan transition-colors"
                  >
                    → Kubernetes HPA
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs/integrations/terraform"
                    className="text-refinex-gray-100 hover:text-refinex-cyan transition-colors"
                  >
                    → Terraform
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs/integrations/cicd"
                    className="text-refinex-gray-100 hover:text-refinex-cyan transition-colors"
                  >
                    → CI/CD Systems
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
