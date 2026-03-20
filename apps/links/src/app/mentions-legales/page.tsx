import { LegalNotice } from '@unanima/rgpd'
import { rgpdConfig } from '@/config/rgpd.config'

export const metadata = {
  title: "Mentions légales — Link's Accompagnement",
}

export default function MentionsLegalesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <LegalNotice config={rgpdConfig} />
    </main>
  )
}
