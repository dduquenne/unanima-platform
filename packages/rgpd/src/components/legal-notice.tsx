import type { RGPDConfig } from '../config'

interface LegalNoticeProps {
  config: RGPDConfig
  className?: string
}

export function LegalNotice({ config, className }: LegalNoticeProps) {
  return (
    <div className={className}>
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">Mentions légales</h1>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">Éditeur du site</h2>
        <p className="text-[var(--color-text)]">{config.organizationName}</p>
        <p className="text-[var(--color-text)]">{config.organizationAddress}</p>
      </section>

      {config.dpoEmail && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">
            Délégué à la protection des données (DPO)
          </h2>
          <p className="text-[var(--color-text)]">
            Contact : <a href={`mailto:${config.dpoEmail}`} className="text-[var(--color-primary)] underline">{config.dpoEmail}</a>
          </p>
        </section>
      )}

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">Hébergement</h2>
        <p className="text-[var(--color-text)]">
          Les données sont hébergées en {config.hostingLocation}.
        </p>
      </section>
    </div>
  )
}
