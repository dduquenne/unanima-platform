import Link from 'next/link'

interface PublicShellProps {
  children: React.ReactNode
}

export function PublicShell({ children }: PublicShellProps) {
  return (
    <div className="min-h-screen bg-[#FFF8F5]">
      {/* ═══ HEADER ═══ */}
      <header
        className="relative"
        style={{ background: 'linear-gradient(135deg, #2A7FD4 0%, #1B6BBF 100%)' }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
              <polygon points="0,0 24,14 0,28" fill="#F28C5A" />
            </svg>
            <div>
              <span className="text-[15px] font-bold text-white">Link{"'"}s</span>
              <span className="ml-1 text-[12px] text-blue-200">Accompagnement</span>
            </div>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/mentions-legales"
              className="text-[13px] text-white/80 transition-colors hover:text-white"
            >
              Mentions légales
            </Link>
            <Link
              href="/cookies"
              className="text-[13px] text-white/80 transition-colors hover:text-white"
            >
              Cookies
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-white/15 px-4 py-1.5 text-[13px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              Connexion
            </Link>
          </nav>
        </div>
        {/* Warm accent line */}
        <div className="h-[3px] bg-[#F28C5A]" />
      </header>

      {/* ═══ CONTENT ═══ */}
      {children}

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-[#1A2332] text-white/70">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col gap-8 md:flex-row md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <svg width="18" height="22" viewBox="0 0 24 28" fill="none">
                  <polygon points="0,0 24,14 0,28" fill="#F28C5A" />
                </svg>
                <span className="text-[14px] font-bold text-white">
                  Link{"'"}s Accompagnement
                </span>
              </div>
              <p className="mt-2 max-w-xs text-[12px] leading-relaxed">
                Plateforme de suivi des bilans de compétences.
                Accompagnement personnalisé et confidentiel.
              </p>
            </div>
            <div className="flex gap-12">
              <div>
                <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-white/50">
                  Informations légales
                </h4>
                <ul className="space-y-2 text-[13px]">
                  <li>
                    <Link href="/mentions-legales" className="hover:text-white transition-colors">
                      Mentions légales
                    </Link>
                  </li>
                  <li>
                    <Link href="/confidentialite" className="hover:text-white transition-colors">
                      Politique de confidentialité
                    </Link>
                  </li>
                  <li>
                    <Link href="/cookies" className="hover:text-white transition-colors">
                      Gestion des cookies
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-white/50">
                  Contact
                </h4>
                <ul className="space-y-2 text-[13px]">
                  <li>dpo@links-accompagnement.fr</li>
                  <li>Paris, France</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-4 text-center text-[11px] text-white/40">
            Link{"'"}s Accompagnement © {new Date().getFullYear()} — Unanima Platform v1.0
          </div>
        </div>
      </footer>
    </div>
  )
}
