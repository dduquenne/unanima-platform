export const metadata = {
  title: "Gestion des cookies — Link's Accompagnement",
}

export default function CookiesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-[var(--color-text)]">
        Gestion des cookies
      </h1>

      <div className="space-y-6 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--color-text)]">
            Qu{"'"}est-ce qu{"'"}un cookie ?
          </h2>
          <p>
            Un cookie est un petit fichier texte déposé sur votre terminal
            (ordinateur, tablette, smartphone) lors de la visite d{"'"}un site
            web. Il permet au site de mémoriser des informations sur votre
            visite, comme vos préférences de langue ou vos identifiants de
            connexion.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--color-text)]">
            Cookies utilisés sur ce site
          </h2>
          <table className="w-full border-collapse border border-[var(--color-border)]">
            <thead>
              <tr className="bg-[var(--color-background)]">
                <th className="border border-[var(--color-border)] px-4 py-2 text-left font-medium text-[var(--color-text)]">
                  Nom
                </th>
                <th className="border border-[var(--color-border)] px-4 py-2 text-left font-medium text-[var(--color-text)]">
                  Finalité
                </th>
                <th className="border border-[var(--color-border)] px-4 py-2 text-left font-medium text-[var(--color-text)]">
                  Durée
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-[var(--color-border)] px-4 py-2">
                  sb-*-auth-token
                </td>
                <td className="border border-[var(--color-border)] px-4 py-2">
                  Authentification (session utilisateur)
                </td>
                <td className="border border-[var(--color-border)] px-4 py-2">
                  Session
                </td>
              </tr>
              <tr>
                <td className="border border-[var(--color-border)] px-4 py-2">
                  unanima_cookie_consent
                </td>
                <td className="border border-[var(--color-border)] px-4 py-2">
                  Mémorisation du choix de consentement cookies
                </td>
                <td className="border border-[var(--color-border)] px-4 py-2">
                  1 an
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--color-text)]">
            Gérer vos préférences
          </h2>
          <p>
            Vous pouvez à tout moment modifier vos préférences en matière de
            cookies. Pour cela, supprimez le cookie{' '}
            <code className="rounded bg-[var(--color-background)] px-1 py-0.5">
              unanima_cookie_consent
            </code>{' '}
            depuis les paramètres de votre navigateur.
          </p>
        </section>
      </div>
    </main>
  )
}
