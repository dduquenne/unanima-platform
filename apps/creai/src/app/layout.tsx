import type { Metadata } from 'next'
import { CookieBanner } from '@unanima/rgpd'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'CREAI Île-de-France',
  description: "Plateforme d'appui à la transformation de l'offre médico-sociale",
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
