'use client'

import { LoginIllustration } from './login-illustration'

export function LoginBrandPanel() {
  return (
    <aside
      className="relative hidden flex-col justify-between overflow-hidden lg:flex"
      style={{
        width: '43%',
        minWidth: 0,
        background: 'linear-gradient(160deg, var(--color-primary-dark) 0%, #134B82 50%, #0A2E58 100%)',
      }}
    >
      {/* Grille de points subtile */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Orbes lumineuses */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: 40,
          left: -40,
          width: 360,
          height: 360,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,165,233,0.3) 0%, rgba(30,111,192,0.05) 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          bottom: 60,
          right: -40,
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,53,0.2) 0%, rgba(255,107,53,0.02) 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          top: 40,
          right: -20,
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'var(--color-secondary)',
          opacity: 0.06,
          filter: 'blur(60px)',
        }}
      />

      {/* Contenu principal */}
      <div className="relative z-10 flex flex-1 flex-col items-center px-8 pt-16">
        {/* Logo */}
        <div
          className="relative flex items-center justify-center"
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '0.8px solid rgba(255,255,255,0.2)',
          }}
        >
          <span className="text-4xl font-extrabold text-white" style={{ letterSpacing: -1 }}>
            L
          </span>
          <div
            className="absolute"
            style={{
              top: -4,
              right: -4,
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent)',
            }}
          />
        </div>

        {/* Titre + tagline */}
        <h1
          className="mt-6 font-bold text-white"
          style={{ fontSize: 28, letterSpacing: -0.5 }}
        >
          Link{"'"}s Accompagnement
        </h1>
        <p className="mt-2 text-white/60" style={{ fontSize: 15, letterSpacing: 0.2 }}>
          Votre espace de suivi personnalisé
        </p>

        {/* Illustration (masquée sur tablette) */}
        <div className="mt-8 hidden xl:block">
          <LoginIllustration />
        </div>
      </div>

      {/* Citation */}
      <div className="relative z-10 px-12 pb-6">
        <div className="flex gap-4">
          <div
            className="shrink-0"
            style={{
              width: 3,
              borderRadius: 1.5,
              backgroundColor: 'var(--color-secondary)',
              opacity: 0.6,
              alignSelf: 'stretch',
            }}
          />
          <div>
            <p className="text-sm italic text-white/70">
              « Chaque parcours est unique.
              <br />
              Nous vous accompagnons à chaque étape. »
            </p>
            <p className="mt-2 text-xs text-white/40">
              — L{"'"}équipe Link{"'"}s
            </p>
          </div>
        </div>

        {/* Badges confiance */}
        <div className="mt-6 flex items-center justify-center gap-6 text-white/40">
          <span className="flex items-center gap-2 text-xs">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <rect x="2" y="6" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.2" />
              <path d="M4 6V4a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Connexion sécurisée
          </span>
          <span className="flex items-center gap-2 text-xs">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1l4 2v4c0 3.5-4 6-4 6S3 10.5 3 7V3l4-2z" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            Conforme RGPD
          </span>
        </div>
      </div>
    </aside>
  )
}
