'use client'

import { useState, useCallback } from 'react'
import { PublicShell } from '@/app/components/public-shell'
import { Cookie, Lock, BarChart3, Settings } from 'lucide-react'

interface CookieCategory {
  id: string
  title: string
  description: string
  icon: typeof Lock
  accentColor: string
  accentBg: string
  locked: boolean
  defaultEnabled: boolean
  count: number
  provider: string
}

const categories: CookieCategory[] = [
  {
    id: 'essential',
    title: 'Cookies essentiels',
    description:
      'Ces cookies sont nécessaires au fonctionnement du site. Ils permettent de gérer votre session de connexion et vos préférences de sécurité. Ils ne peuvent pas être désactivés.',
    icon: Lock,
    accentColor: '#2A7FD4',
    accentBg: '#E8F4FD',
    locked: true,
    defaultEnabled: true,
    count: 2,
    provider: 'Supabase Auth',
  },
  {
    id: 'analytics',
    title: 'Cookies analytiques',
    description:
      "Ces cookies nous permettent de mesurer l'audience du site et d'analyser les parcours de navigation pour améliorer nos services. Les données collectées sont anonymisées.",
    icon: BarChart3,
    accentColor: '#F28C5A',
    accentBg: '#FFF3EB',
    locked: false,
    defaultEnabled: false,
    count: 1,
    provider: 'Vercel Analytics',
  },
  {
    id: 'preferences',
    title: 'Cookies de préférences',
    description:
      'Ces cookies mémorisent vos choix (langue, thème, préférences d\'affichage) pour personnaliser votre expérience sur la plateforme.',
    icon: Settings,
    accentColor: '#22C55E',
    accentBg: '#ECFDF5',
    locked: false,
    defaultEnabled: true,
    count: 1,
    provider: 'Link\'s Accompagnement',
  },
]

const cookieDetails = [
  {
    name: 'sb-auth-token',
    purpose: 'Authentification et maintien de la session utilisateur',
    duration: 'Session',
    provider: 'Supabase',
    category: 'Essentiel',
    categoryColor: '#2A7FD4',
    categoryBg: '#E8F4FD',
  },
  {
    name: 'cookie_consent',
    purpose: 'Mémorisation de vos choix de consentement cookies',
    duration: '1 an',
    provider: "Link's Accompagnement",
    category: 'Essentiel',
    categoryColor: '#2A7FD4',
    categoryBg: '#E8F4FD',
  },
  {
    name: '_va',
    purpose: "Mesure d'audience et analyse de la navigation",
    duration: '24 heures',
    provider: 'Vercel Analytics',
    category: 'Analytique',
    categoryColor: '#F28C5A',
    categoryBg: '#FFF3EB',
  },
]

function Toggle({
  enabled,
  locked,
  accentColor,
  onChange,
}: {
  enabled: boolean
  locked: boolean
  accentColor: string
  onChange: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={locked}
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
        locked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
      }`}
      style={{ backgroundColor: enabled ? accentColor : '#D1D5DB' }}
    >
      <span
        className="inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform"
        style={{ transform: enabled ? 'translateX(22px)' : 'translateX(4px)' }}
      />
    </button>
  )
}

export default function CookiesPage() {
  const [consents, setConsents] = useState<Record<string, boolean>>(() => {
    const defaults: Record<string, boolean> = {}
    categories.forEach((c) => {
      defaults[c.id] = c.locked || c.defaultEnabled
    })
    return defaults
  })

  const toggleCategory = useCallback((id: string) => {
    setConsents((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const handleSave = useCallback(() => {
    document.cookie = `unanima_cookie_consent=${JSON.stringify(consents)};path=/;max-age=31536000;SameSite=Lax`
    window.dispatchEvent(new CustomEvent('cookie-consent-update', { detail: consents }))
  }, [consents])

  const handleAcceptAll = useCallback(() => {
    const all: Record<string, boolean> = {}
    categories.forEach((c) => { all[c.id] = true })
    setConsents(all)
    document.cookie = `unanima_cookie_consent=${JSON.stringify(all)};path=/;max-age=31536000;SameSite=Lax`
    window.dispatchEvent(new CustomEvent('cookie-consent-update', { detail: all }))
  }, [])

  const handleRejectAll = useCallback(() => {
    const minimal: Record<string, boolean> = {}
    categories.forEach((c) => { minimal[c.id] = c.locked })
    setConsents(minimal)
    document.cookie = `unanima_cookie_consent=${JSON.stringify(minimal)};path=/;max-age=31536000;SameSite=Lax`
    window.dispatchEvent(new CustomEvent('cookie-consent-update', { detail: minimal }))
  }, [])

  return (
    <PublicShell>
      {/* ═══ HERO ═══ */}
      <section className="bg-[#FFF0E8] px-6 py-14 text-center">
        <div className="mx-auto flex max-w-xl flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/80">
            <Cookie className="h-8 w-8 text-[#F28C5A]" />
          </div>
          <h1 className="text-[28px] font-bold text-[#2C2017]">
            Gestion des cookies
          </h1>
          <p className="mt-3 text-[14px] text-[#7B6B5A]">
            Configurez vos préférences en matière de cookies. Les cookies essentiels
            sont toujours actifs pour garantir le bon fonctionnement du site.
          </p>
        </div>
      </section>

      {/* ═══ INFO BOX ═══ */}
      <div className="mx-auto max-w-3xl px-6 pt-10">
        <div className="rounded-[14px] bg-[#FFF3EB] px-5 py-4 text-[13px] leading-relaxed text-[#7B6B5A]">
          <strong className="text-[#2C2017]">Qu{"'"}est-ce qu{"'"}un cookie ?</strong>{' '}
          Un cookie est un petit fichier texte déposé sur votre terminal lors de la visite
          d{"'"}un site web. Il permet de mémoriser des informations sur votre visite.
          Les cookies essentiels sont toujours actifs et ne peuvent pas être désactivés.
        </div>
      </div>

      {/* ═══ COOKIE CATEGORIES ═══ */}
      <section className="mx-auto max-w-3xl space-y-5 px-6 py-8">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="overflow-hidden rounded-[18px] bg-white"
            style={{
              boxShadow: '0 2px 12px rgba(212,165,116,0.1)',
              borderLeft: `4px solid ${cat.accentColor}`,
            }}
          >
            <div className="flex items-start justify-between gap-4 p-5">
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: cat.accentBg }}
                >
                  <cat.icon className="h-5 w-5" style={{ color: cat.accentColor }} />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#2C2017]">{cat.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#7B6B5A]">
                    {cat.description}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-[#A0927E]">
                    <span>{cat.count} cookie{cat.count > 1 ? 's' : ''}</span>
                    <span className="text-[#F2D5C4]">·</span>
                    <span>{cat.provider}</span>
                  </div>
                </div>
              </div>
              <div className="pt-1">
                <Toggle
                  enabled={consents[cat.id] ?? false}
                  locked={cat.locked}
                  accentColor={cat.accentColor}
                  onChange={() => toggleCategory(cat.id)}
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ═══ ACTION BUTTONS ═══ */}
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-3 px-6 pb-8">
        <button
          onClick={handleSave}
          className="rounded-full bg-[#2A7FD4] px-6 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1A6BBF]"
        >
          Enregistrer mes choix
        </button>
        <button
          onClick={handleAcceptAll}
          className="rounded-full border-2 border-[#F28C5A] bg-white px-6 py-2.5 text-[13px] font-semibold text-[#F28C5A] transition-colors hover:bg-[#FFF3EB]"
        >
          Tout accepter
        </button>
        <button
          onClick={handleRejectAll}
          className="rounded-full border border-[#D1D5DB] bg-white px-6 py-2.5 text-[13px] font-semibold text-[#7B6B5A] transition-colors hover:bg-[#FFF8F5]"
        >
          Tout refuser
        </button>
      </div>

      {/* ═══ COOKIE DETAILS TABLE ═══ */}
      <section className="mx-auto max-w-3xl px-6 pb-12">
        <h2 className="mb-4 text-[16px] font-bold text-[#2C2017]">
          Détail des cookies utilisés
        </h2>
        <div
          className="overflow-hidden rounded-[18px] bg-white"
          style={{ boxShadow: '0 2px 12px rgba(212,165,116,0.1)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-[#FFF8F2]">
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#8B7B6B]">Cookie</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#8B7B6B]">Finalité</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#8B7B6B]">Durée</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#8B7B6B]">Fournisseur</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#8B7B6B]">Catégorie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5E6DB]">
                {cookieDetails.map((cookie) => (
                  <tr key={cookie.name} className="hover:bg-[#FFF8F5] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#2C2017]">
                      <code className="rounded bg-[#FFF8F5] px-1.5 py-0.5 text-[11px]">{cookie.name}</code>
                    </td>
                    <td className="px-4 py-3 text-[#7B6B5A]">{cookie.purpose}</td>
                    <td className="px-4 py-3 text-[#7B6B5A]">{cookie.duration}</td>
                    <td className="px-4 py-3 text-[#7B6B5A]">{cookie.provider}</td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                        style={{
                          backgroundColor: cookie.categoryBg,
                          color: cookie.categoryColor,
                        }}
                      >
                        {cookie.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PublicShell>
  )
}
