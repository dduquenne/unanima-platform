import { PublicShell } from '@/app/components/public-shell'
import {
  Building2,
  User,
  Server,
  ShieldCheck,
  Lock,
} from 'lucide-react'

export const metadata = {
  title: "Mentions légales — Link's Accompagnement",
}

const sections = [
  {
    icon: Building2,
    iconBg: '#E8F4FD',
    iconColor: '#2A7FD4',
    title: 'Éditeur du site',
    content: [
      { label: 'Raison sociale', value: "Link's Accompagnement" },
      { label: 'Forme juridique', value: 'SAS au capital de 10 000 €' },
      { label: 'SIRET', value: '123 456 789 00012' },
      { label: 'Siège social', value: '12 rue de la Formation, 75008 Paris' },
      { label: 'RCS', value: 'Paris B 123 456 789' },
      { label: 'N° TVA', value: 'FR 12 345678901' },
    ],
  },
  {
    icon: User,
    iconBg: '#FFF3EB',
    iconColor: '#F28C5A',
    title: 'Directeur de la publication',
    content: [
      { label: 'Nom', value: 'Marie Dupont' },
      { label: 'Qualité', value: "Directrice générale de Link's Accompagnement" },
      { label: 'Email', value: 'direction@links-accompagnement.fr' },
      { label: 'Téléphone', value: '+33 1 23 45 67 89' },
    ],
  },
  {
    icon: Server,
    iconBg: '#E8F4FD',
    iconColor: '#2A7FD4',
    title: 'Hébergement',
    content: [
      { label: 'Hébergeur', value: 'Vercel Inc.' },
      { label: 'Adresse', value: '340 S Lemon Ave #4133, Walnut, CA 91789, USA' },
      { label: 'Site web', value: 'vercel.com' },
      { label: 'Contact', value: 'privacy@vercel.com' },
    ],
  },
  {
    icon: ShieldCheck,
    iconBg: '#FFF3EB',
    iconColor: '#F28C5A',
    title: 'Propriété intellectuelle',
    paragraph:
      "L'ensemble des contenus présents sur ce site (textes, images, graphismes, logos, icônes, logiciels) est protégé par les lois françaises et internationales relatives à la propriété intellectuelle. Toute reproduction, représentation, modification ou adaptation, totale ou partielle, de ce site ou de l'un quelconque des éléments qui le composent, par quelque procédé que ce soit, est strictement interdite sans l'autorisation écrite préalable de Link's Accompagnement.",
  },
  {
    icon: Lock,
    iconBg: '#E8F4FD',
    iconColor: '#2A7FD4',
    title: 'Protection des données',
    paragraph:
      "Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, de suppression, de portabilité et d'opposition sur vos données personnelles. Pour exercer ces droits ou pour toute question relative à la protection de vos données, contactez notre Délégué à la Protection des Données (DPO) à l'adresse : dpo@links-accompagnement.fr. Pour plus de détails, consultez notre Politique de confidentialité.",
  },
]

export default function MentionsLegalesPage() {
  return (
    <PublicShell>
      {/* ═══ HERO ═══ */}
      <section className="bg-[#FFF0E8] px-6 py-14 text-center">
        <h1 className="text-[28px] font-bold text-[#2C2017]">
          Mentions légales
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[14px] text-[#7B6B5A]">
          Informations légales conformément aux dispositions de la loi n° 2004-575
          du 21 juin 2004 pour la confiance dans l{"'"}économie numérique.
        </p>
      </section>

      {/* ═══ SECTIONS ═══ */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          {sections.map((section, idx) => {
            const isFullWidth = idx === sections.length - 1 && sections.length % 2 !== 0
            return (
              <div
                key={section.title}
                className={`rounded-[18px] bg-white p-6 ${isFullWidth ? 'md:col-span-2' : ''}`}
                style={{ boxShadow: '0 2px 12px rgba(212,165,116,0.1)' }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-full"
                    style={{ backgroundColor: section.iconBg }}
                  >
                    <section.icon
                      className="h-5 w-5"
                      style={{ color: section.iconColor }}
                    />
                  </div>
                  <h2 className="text-[16px] font-bold text-[#2C2017]">
                    {section.title}
                  </h2>
                </div>
                {section.content ? (
                  <dl className="space-y-2">
                    {section.content.map((item) => (
                      <div key={item.label} className="flex gap-2 text-[13px]">
                        <dt className="min-w-[120px] font-medium text-[#7B6B5A]">
                          {item.label}
                        </dt>
                        <dd className="text-[#2C2017]">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-[13px] leading-relaxed text-[#7B6B5A]">
                    {section.paragraph}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </PublicShell>
  )
}
