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
  title: 'RefineX — Cloud signal intelligence for your infrastructure',
  description: 'Confidence-scored spot market signals with regime context. Advisory signal intelligence for DevOps teams, autoscalers, and CI/CD pipelines.',
  keywords: ['spot instances', 'cloud', 'cost optimization', 'kubernetes', 'autoscaling', 'FinOps', 'signal intelligence', 'spot market'],
  authors: [{ name: 'RefineX' }],
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'RefineX — Cloud signal intelligence for your infrastructure',
    description: 'Confidence-scored spot market signals with regime context. Delivered via API, MCP, CLI, and real-time dashboard. Advisory-only.',
    type: 'website',
    siteName: 'RefineX',
    url: 'https://refinex.io',
    images: [
      {
        url: 'https://www.refinex.io/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RefineX — Cloud signal intelligence',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RefineX — Cloud signal intelligence for your infrastructure',
    description: 'Confidence-scored spot market signals with regime context. Advisory-only. Built for DevOps teams who want data before decisions.',
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
      <head>
        <script
          type="text/javascript"
          src="https://app.termly.io/resource-blocker/6dc8ed3d-d082-4433-a866-e4ac24490e58?autoBlock=on"
          async
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <PostHogProvider
          posthogKey={process.env.NEXT_PUBLIC_POSTHOG_KEY ?? ''}
          posthogHost={process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'}
        >
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
