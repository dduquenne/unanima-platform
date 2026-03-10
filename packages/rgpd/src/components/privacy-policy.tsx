import type { RGPDConfig } from '../config'

interface PrivacyPolicyProps {
  config: RGPDConfig
  className?: string
}

export function PrivacyPolicy({ config, className }: PrivacyPolicyProps) {
  return (
    <div className={className}>
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">
        Politique de confidentialité
      </h1>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">
          Responsable du traitement
        </h2>
        <p className="text-[var(--color-text)]">
          {config.organizationName}, situé au {config.organizationAddress}.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">
          Finalités du traitement
        </h2>
        <p className="text-[var(--color-text)] mb-2">
          Les données personnelles collectées sont traitées pour les finalités suivantes :
        </p>
        <ul className="list-disc pl-6 text-[var(--color-text)]">
          {config.dataFinalites.map((finalite) => (
            <li key={finalite}>{finalite}</li>
          ))}
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">
          Durée de conservation
        </h2>
        <p className="text-[var(--color-text)]">
          Les données sont conservées pendant une durée maximale de{' '}
          {config.dataRetentionDays} jours à compter de leur collecte.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">
          Hébergement des données
        </h2>
        <p className="text-[var(--color-text)]">
          Les données sont hébergées en {config.hostingLocation}.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">Vos droits</h2>
        <p className="text-[var(--color-text)]">
          Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez
          des droits suivants : droit d&apos;accès, de rectification, d&apos;effacement, de
          limitation du traitement, de portabilité des données et d&apos;opposition.
        </p>
        {config.dpoEmail && (
          <p className="text-[var(--color-text)] mt-2">
            Pour exercer vos droits, contactez-nous à :{' '}
            <a href={`mailto:${config.dpoEmail}`} className="text-[var(--color-primary)] underline">
              {config.dpoEmail}
            </a>
          </p>
        )}
      </section>
    </div>
  )
}
