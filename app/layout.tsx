import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://refinex.io'),
  title: 'RefineX - Spot Instance Arbitrage Signals API',
  description: 'API-only system that emits cloud spot price arbitrage signals. 60-90% cost savings for Kubernetes autoscalers, CI/CD systems, and batch schedulers.',
  keywords: ['spot instances', 'AWS', 'GCP', 'Azure', 'cost optimization', 'kubernetes', 'autoscaling'],
  authors: [{ name: 'RefineX' }],
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'RefineX - Spot Instance Arbitrage Signals API',
    description: '60-90% cost savings on cloud compute with real-time spot arbitrage signals',
    type: 'website',
    url: 'https://refinex.io',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RefineX - Spot Arbitrage Signals',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RefineX - Spot Instance Arbitrage Signals API',
    description: '60-90% cost savings on cloud compute',
    images: ['/og-image.png'],
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
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
