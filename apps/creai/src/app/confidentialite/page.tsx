import { PrivacyPolicy } from '@unanima/rgpd'
import { rgpdConfig } from '@/config/rgpd.config'

export const metadata = {
  title: 'Politique de confidentialité — CREAI Île-de-France',
}

export default function ConfidentialitePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <PrivacyPolicy config={rgpdConfig} />
    </main>
  )
}
