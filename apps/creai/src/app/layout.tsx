import type { Metadata } from 'next'
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
        {children}
      </body>
    </html>
  )
}
