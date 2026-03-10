import type { Metadata } from 'next'
import '../styles/theme.css'

export const metadata: Metadata = {
  title: 'Unanima',
  description: 'Application Unanima',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
