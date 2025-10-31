import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import ConditionalHeader from '@/components/ConditionalHeader'
import { ToastProvider } from '@/components/ToastProvider'
import ThemeInit from '@/components/ThemeInit'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OTT Platform - Stream Your Favorite Content',
  description: 'Watch movies, TV shows, and live content on our premium streaming platform.',
  keywords: 'streaming, movies, TV shows, entertainment, OTT platform',
  authors: [{ name: 'OTT Platform Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'OTT Platform - Stream Your Favorite Content',
    description: 'Watch movies, TV shows, and live content on our premium streaming platform.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OTT Platform - Stream Your Favorite Content',
    description: 'Watch movies, TV shows, and live content on our premium streaming platform.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-netflix-black text-white`} suppressHydrationWarning>
        <div id="root">
          <ToastProvider>
            <AuthProvider>
              {/* Ensure theme variables apply early on every page */}
              <ThemeInit />
              <ConditionalHeader />
              <main className="pt-16">
                {children}
              </main>
            </AuthProvider>
          </ToastProvider>
        </div>
      </body>
    </html>
  )
}
