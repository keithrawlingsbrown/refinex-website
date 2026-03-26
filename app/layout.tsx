import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { PostHogProvider } from './providers/PostHogProvider'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.refinex.io'),
  title: 'RefineX — Spot instance intelligence for your autoscaler',
  description: 'Confidence-scored AWS spot market signals with regime context. API-first advisory signals for FinOps teams, Kubernetes autoscalers, and CI/CD pipelines.',
  keywords: ['spot instances', 'AWS', 'cost optimization', 'kubernetes', 'autoscaling', 'FinOps', 'spot market signals'],
  authors: [{ name: 'RefineX' }],
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'RefineX — Spot instance intelligence for your autoscaler',
    description: 'Confidence-scored AWS spot market signals with regime context. API-first. Advisory-only. Built for FinOps teams who want data before decisions.',
    type: 'website',
    siteName: 'RefineX',
    url: 'https://refinex.io',
    images: [
      {
        url: 'https://www.refinex.io/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RefineX — Spot instance intelligence',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RefineX — Spot instance intelligence for your autoscaler',
    description: 'Confidence-scored AWS spot market signals with regime context. API-first. Advisory-only.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen flex flex-col">
        <PostHogProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </PostHogProvider>
      </body>
    </html>
  )
}
