import type { Metadata } from 'next'
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
        {children}
      </body>
    </html>
  )
}
