'use client'

import { LoginIllustration } from './login-illustration'

export function LoginBrandPanel() {
  return (
    <aside
      className="relative hidden flex-col justify-between overflow-hidden lg:flex"
      style={{
        width: '46%',
        minWidth: 0,
        background: 'linear-gradient(160deg, #0D3B6E 0%, #1A5BA0 100%)',
      }}
    >
      {/* Organic blob shapes (MAQ-01 chaleureux) */}
      <div className="pointer-events-none absolute inset-0">
        {/* Large blob top-right */}
        <div
          className="absolute"
          style={{
            top: -40,
            right: -60,
            width: 400,
            height: 360,
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            opacity: 0.04,
            transform: 'rotate(-15deg)',
          }}
        />
        {/* Blob bottom-left */}
        <div
          className="absolute"
          style={{
            bottom: -40,
            left: -80,
            width: 500,
            height: 400,
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            opacity: 0.05,
            transform: 'rotate(10deg)',
          }}
        />
        {/* Warm accent blobs */}
        <div
          className="absolute"
          style={{
            top: '35%',
            right: '15%',
            width: 120,
            height: 120,
            borderRadius: '50%',
            backgroundColor: '#FF6B35',
            opacity: 0.08,
          }}
        />
        <div
          className="absolute"
          style={{
            top: '45%',
            left: '15%',
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: '#F28C5A',
            opacity: 0.06,
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: '20%',
            right: '25%',
            width: 70,
            height: 70,
            borderRadius: '50%',
            backgroundColor: '#FF6B35',
            opacity: 0.06,
          }}
        />
        {/* Wave decoration */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 660 300" preserveAspectRatio="none" style={{ height: '33%' }}>
          <path d="M0,200 Q160,140 330,180 Q500,220 660,160 L660,300 L0,300 Z" fill="white" opacity="0.03" />
          <path d="M0,230 Q200,190 400,220 Q550,250 660,200 L660,300 L0,300 Z" fill="white" opacity="0.03" />
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-1 flex-col px-10 pt-16 xl:px-12">
        {/* Logo */}
        <div className="flex items-baseline gap-0">
          <span className="text-3xl font-bold text-white" style={{ letterSpacing: 0.3 }}>Link{"'"}s</span>
          {/* Orange polygon accent */}
          <svg width="12" height="22" viewBox="0 0 12 22" className="-ml-0.5 -mt-5" aria-hidden="true">
            <polygon points="0,0 12,0 10,22 2,22" fill="#FF6B35" />
          </svg>
          <span className="ml-1 text-3xl font-normal" style={{ color: '#A8C8F0', letterSpacing: 0.3 }}>Accompagnement</span>
        </div>

        {/* Tagline */}
        <p className="mt-4 text-lg leading-relaxed" style={{ color: '#C4D8F0' }}>
          Plateforme de suivi des bilans
          <br />
          de compétences
        </p>

        {/* Illustration (hidden on tablet) */}
        <div className="mt-8 hidden xl:block">
          <LoginIllustration />
        </div>
      </div>

      {/* Bottom section */}
      <div className="relative z-10 px-10 pb-8 xl:px-12">
        {/* Quote */}
        <p className="text-base font-semibold text-white/70">
          &laquo; Chaque bilan est un nouveau départ. &raquo;
        </p>
        <p className="mt-2 text-sm" style={{ color: '#A8C8F0', opacity: 0.6 }}>
          — L{"'"}équipe Link{"'"}s Accompagnement
        </p>

        {/* Footer */}
        <p className="mt-8 text-xs" style={{ color: '#A8C8F0', opacity: 0.4 }}>
          © {new Date().getFullYear()} Link{"'"}s Accompagnement — Tous droits réservés
        </p>
      </div>
    </aside>
  )
}
