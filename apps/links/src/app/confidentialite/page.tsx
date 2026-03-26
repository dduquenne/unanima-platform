'use client'

import { useState } from 'react'
import { PublicShell } from '@/app/components/public-shell'
import { Shield, Mail, Phone } from 'lucide-react'

const articles = [
  {
    id: 'responsable',
    num: 1,
    title: 'Responsable du traitement',
    accent: 'orange',
    content: (
      <div className="space-y-2 text-[13px] text-[#7B6B5A]">
        <p>Le responsable du traitement des données collectées sur ce site est :</p>
        <dl className="mt-3 space-y-1.5">
          <div className="flex gap-2"><dt className="min-w-[120px] font-medium">Raison sociale</dt><dd>Link{"'"}s Accompagnement (SAS)</dd></div>
          <div className="flex gap-2"><dt className="min-w-[120px] font-medium">Adresse</dt><dd>12 rue de la Formation, 75008 Paris</dd></div>
          <div className="flex gap-2"><dt className="min-w-[120px] font-medium">Email</dt><dd>direction@links-accompagnement.fr</dd></div>
          <div className="flex gap-2"><dt className="min-w-[120px] font-medium">SIRET</dt><dd>123 456 789 00012</dd></div>
        </dl>
      </div>
    ),
  },
  {
    id: 'finalites',
    num: 2,
    title: 'Finalités des traitements',
    accent: 'blue',
    content: (
      <div className="space-y-3 text-[13px] text-[#7B6B5A]">
        <p>Vos données personnelles sont collectées et traitées pour les finalités suivantes :</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Gestion des bilans de compétences et suivi des bénéficiaires</li>
          <li>Communication entre consultants et bénéficiaires</li>
          <li>Génération de rapports et documents de bilan</li>
          <li>Envoi de notifications par e-mail</li>
          <li>Gestion des comptes utilisateurs et authentification</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'bases-legales',
    num: 3,
    title: 'Bases légales',
    accent: 'orange',
    content: (
      <div className="space-y-3 text-[13px] text-[#7B6B5A]">
        <p>Les traitements de données sont fondés sur les bases légales suivantes :</p>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full border-collapse text-[12px]">
            <thead>
              <tr className="bg-[#FFF8F5]">
                <th className="border border-[#F0E6DD] px-3 py-2 text-left font-semibold text-[#2C2017]">Traitement</th>
                <th className="border border-[#F0E6DD] px-3 py-2 text-left font-semibold text-[#2C2017]">Base légale</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-[#F0E6DD] px-3 py-2">Suivi du bilan de compétences</td><td className="border border-[#F0E6DD] px-3 py-2">Exécution du contrat</td></tr>
              <tr><td className="border border-[#F0E6DD] px-3 py-2">Communication par email</td><td className="border border-[#F0E6DD] px-3 py-2">Intérêt légitime</td></tr>
              <tr><td className="border border-[#F0E6DD] px-3 py-2">Cookies analytiques</td><td className="border border-[#F0E6DD] px-3 py-2">Consentement</td></tr>
              <tr><td className="border border-[#F0E6DD] px-3 py-2">Gestion des comptes</td><td className="border border-[#F0E6DD] px-3 py-2">Exécution du contrat</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  {
    id: 'durees',
    num: 4,
    title: 'Durées de conservation',
    accent: 'blue',
    content: (
      <div className="space-y-3 text-[13px] text-[#7B6B5A]">
        <p>Vos données sont conservées pour les durées suivantes :</p>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full border-collapse text-[12px]">
            <thead>
              <tr className="bg-[#FFF8F5]">
                <th className="border border-[#F0E6DD] px-3 py-2 text-left font-semibold text-[#2C2017]">Catégorie de données</th>
                <th className="border border-[#F0E6DD] px-3 py-2 text-left font-semibold text-[#2C2017]">Durée</th>
                <th className="border border-[#F0E6DD] px-3 py-2 text-left font-semibold text-[#2C2017]">Justification</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-[#F0E6DD] px-3 py-2">Données de bilan</td><td className="border border-[#F0E6DD] px-3 py-2">3 ans</td><td className="border border-[#F0E6DD] px-3 py-2">Obligation légale (Code du travail)</td></tr>
              <tr><td className="border border-[#F0E6DD] px-3 py-2">Comptes utilisateurs</td><td className="border border-[#F0E6DD] px-3 py-2">Durée du contrat + 3 ans</td><td className="border border-[#F0E6DD] px-3 py-2">Prescription légale</td></tr>
              <tr><td className="border border-[#F0E6DD] px-3 py-2">Logs de connexion</td><td className="border border-[#F0E6DD] px-3 py-2">1 an</td><td className="border border-[#F0E6DD] px-3 py-2">Obligation légale (LCEN)</td></tr>
              <tr><td className="border border-[#F0E6DD] px-3 py-2">Cookies</td><td className="border border-[#F0E6DD] px-3 py-2">13 mois maximum</td><td className="border border-[#F0E6DD] px-3 py-2">Recommandation CNIL</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  {
    id: 'droits',
    num: 5,
    title: 'Vos droits',
    accent: 'orange',
    content: (
      <div className="space-y-3 text-[13px] text-[#7B6B5A]">
        <p>
          Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {['Accès', 'Rectification', 'Effacement', 'Portabilité', 'Opposition', 'Limitation'].map((right) => (
            <span
              key={right}
              className="rounded-full bg-[#FFF0E8] px-3.5 py-1.5 text-[12px] font-semibold text-[#F28C5A]"
            >
              {right}
            </span>
          ))}
        </div>
        <p className="mt-3">
          Pour exercer vos droits, contactez notre DPO par email à{' '}
          <strong>dpo@links-accompagnement.fr</strong> ou utilisez la page{' '}
          <em>Mes données</em> depuis votre espace connecté.
        </p>
      </div>
    ),
  },
  {
    id: 'dpo',
    num: 6,
    title: 'Délégué à la Protection des Données (DPO)',
    accent: 'blue',
    content: (
      <div
        className="rounded-[14px] p-5"
        style={{ background: 'linear-gradient(135deg, #FFF3EB 0%, #FDEBD5 100%)' }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#F28C5A]">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <div className="space-y-1.5 text-[13px]">
            <p className="font-bold text-[#2C2017]">Délégué à la Protection des Données</p>
            <div className="flex items-center gap-2 text-[#7B6B5A]">
              <Mail className="h-3.5 w-3.5" />
              <span>dpo@links-accompagnement.fr</span>
            </div>
            <div className="flex items-center gap-2 text-[#7B6B5A]">
              <Phone className="h-3.5 w-3.5" />
              <span>+33 1 23 45 67 89</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'cnil',
    num: 7,
    title: 'Réclamation auprès de la CNIL',
    accent: 'orange',
    content: (
      <div className="space-y-2 text-[13px] text-[#7B6B5A]">
        <p>
          Si vous estimez que le traitement de vos données personnelles constitue une violation
          du RGPD, vous avez le droit d{"'"}introduire une réclamation auprès de la Commission
          Nationale de l{"'"}Informatique et des Libertés (CNIL).
        </p>
        <dl className="mt-3 space-y-1.5">
          <div className="flex gap-2"><dt className="min-w-[80px] font-medium">Adresse</dt><dd>3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07</dd></div>
          <div className="flex gap-2"><dt className="min-w-[80px] font-medium">Site web</dt><dd>www.cnil.fr</dd></div>
          <div className="flex gap-2"><dt className="min-w-[80px] font-medium">Téléphone</dt><dd>01 53 73 22 22</dd></div>
        </dl>
      </div>
    ),
  },
]

export default function ConfidentialitePage() {
  const [activeTab, setActiveTab] = useState('responsable')

  return (
    <PublicShell>
      {/* ═══ HERO ═══ */}
      <section className="bg-[#FFF0E8] px-6 py-14 text-center">
        <div className="mx-auto flex max-w-xl flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/80">
            <Shield className="h-8 w-8 text-[#2A7FD4]" />
          </div>
          <h1 className="text-[28px] font-bold text-[#2C2017]">
            Politique de confidentialité
          </h1>
          <p className="mt-3 text-[14px] text-[#7B6B5A]">
            Découvrez comment nous protégeons vos données personnelles conformément au RGPD.
          </p>
          <p className="mt-2 text-[11px] text-[#A0927E]">
            Dernière mise à jour : mars 2026
          </p>
        </div>
      </section>

      {/* ═══ TAB NAVIGATION ═══ */}
      <div className="sticky top-0 z-10 border-b border-[#F0E6DD] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl gap-1.5 overflow-x-auto px-6 py-3">
          {articles.map((article) => (
            <button
              key={article.id}
              onClick={() => {
                setActiveTab(article.id)
                document.getElementById(`article-${article.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                activeTab === article.id
                  ? 'bg-[#2A7FD4] text-white'
                  : 'bg-[#FFF0E8] text-[#7B6B5A] hover:bg-[#FDEBD5]'
              }`}
            >
              {article.num}. {article.title}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ ARTICLES ═══ */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-6 md:grid-cols-2">
          {articles.map((article) => {
            const isFullWidth = article.id === 'droits' || article.id === 'dpo' || article.id === 'cnil'
            return (
              <div
                key={article.id}
                id={`article-${article.id}`}
                className={`scroll-mt-20 rounded-[18px] bg-white p-6 ${isFullWidth ? 'md:col-span-2' : ''}`}
                style={{
                  boxShadow: '0 2px 12px rgba(212,165,116,0.1)',
                  borderTop: `3px solid ${article.accent === 'orange' ? '#F28C5A' : '#2A7FD4'}`,
                }}
              >
                <h2 className="mb-4 flex items-center gap-2 text-[16px] font-bold text-[#2C2017]">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold text-white"
                    style={{ backgroundColor: article.accent === 'orange' ? '#F28C5A' : '#2A7FD4' }}
                  >
                    {article.num}
                  </span>
                  {article.title}
                </h2>
                {article.content}
              </div>
            )
          })}
        </div>
      </section>
    </PublicShell>
  )
}
