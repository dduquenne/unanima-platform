import type { Metadata } from 'next'
import { CookieBanner } from '@unanima/rgpd'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Omega Automotive',
  description: 'Dashboard opérationnel SAV',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Providers>
          {children}
          <CookieBanner />
        </Providers>
      </body>
    </html>
  )
}
