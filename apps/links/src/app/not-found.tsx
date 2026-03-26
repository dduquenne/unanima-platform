'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: 'linear-gradient(180deg, #FFF8F5 0%, #FFF0E8 100%)' }}>
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute" style={{ bottom: '10%', left: '5%', width: 500, height: 400, borderRadius: '50%', backgroundColor: '#F28C5A', opacity: 0.04 }} />
        <div className="absolute" style={{ top: '15%', right: '5%', width: 400, height: 360, borderRadius: '50%', backgroundColor: '#2A7FD4', opacity: 0.03 }} />
        <div className="absolute" style={{ bottom: '20%', right: '15%', width: 240, height: 240, borderRadius: '50%', backgroundColor: '#F28C5A', opacity: 0.03 }} />
      </div>

      {/* Header */}
      <header
        style={{ background: 'linear-gradient(90deg, #2271C1, #2A7FD4)' }}
      >
        <div className="flex h-16 items-center px-6 sm:px-12">
          <span className="text-[22px] font-bold tracking-wide text-white">Link{"'"}s</span>
          <div className="ml-1.5 h-3 w-3 rounded-full" style={{ backgroundColor: '#F28C5A' }} />
        </div>
        {/* Orange accent bar */}
        <div className="h-1" style={{ background: 'linear-gradient(90deg, #F28C5A, #F6A97A)' }} />
      </header>

      {/* Main content */}
      <main className="relative flex flex-1 items-center justify-center p-6">
        <div
          className="w-full overflow-hidden text-center"
          style={{
            maxWidth: 760,
            borderRadius: 20,
            backgroundColor: '#FFFFFF',
            boxShadow: '0 8px 40px rgba(242, 140, 90, 0.12)',
            padding: '48px 32px 40px',
          }}
        >
          {/* Compass illustration */}
          <div className="mx-auto mb-6">
            <svg viewBox="0 0 120 120" className="mx-auto h-28 w-28" aria-hidden="true">
              {/* Outer ring */}
              <circle cx="60" cy="60" r="55" fill="none" stroke="#2A7FD4" strokeWidth="2" opacity="0.15" />
              <circle cx="60" cy="60" r="42" fill="none" stroke="#F28C5A" strokeWidth="1.5" opacity="0.2" />
              <circle cx="60" cy="60" r="3.5" fill="#F28C5A" opacity="0.5" />
              {/* Compass needle */}
              <polygon points="60,20 56,60 60,55 64,60" fill="#F28C5A" opacity="0.4" />
              <polygon points="60,100 56,60 60,65 64,60" fill="#2A7FD4" opacity="0.3" />
              {/* N E S O markers */}
              <text x="60" y="14" fill="#2A7FD4" fontSize="9" fontWeight="600" textAnchor="middle" opacity="0.3" fontFamily="Inter, sans-serif">N</text>
              <text x="110" y="64" fill="#2A7FD4" fontSize="9" fontWeight="600" textAnchor="middle" opacity="0.3" fontFamily="Inter, sans-serif">E</text>
              <text x="60" y="114" fill="#2A7FD4" fontSize="9" fontWeight="600" textAnchor="middle" opacity="0.3" fontFamily="Inter, sans-serif">S</text>
              <text x="10" y="64" fill="#2A7FD4" fontSize="9" fontWeight="600" textAnchor="middle" opacity="0.3" fontFamily="Inter, sans-serif">O</text>
              {/* Floating shapes */}
              <circle cx="15" cy="30" r="6" fill="#F28C5A" opacity="0.08" />
              <circle cx="105" cy="85" r="5" fill="#2A7FD4" opacity="0.08" />
            </svg>
          </div>

          {/* 404 typography */}
          <div className="relative mx-auto mb-2" style={{ width: 'fit-content' }}>
            <span className="text-8xl font-extrabold sm:text-[96px]" style={{ color: '#2A7FD4', letterSpacing: -2 }}>4</span>
            {/* Circle with ? replacing the 0 */}
            <span className="relative inline-block align-middle" style={{ width: 64, height: 64, marginInline: 4 }}>
              <svg viewBox="0 0 64 64" className="h-16 w-16">
                <circle cx="32" cy="32" r="30" fill="none" stroke="#F28C5A" strokeWidth="3" />
                <text x="32" y="40" fill="#F28C5A" fontSize="28" fontWeight="700" textAnchor="middle" fontFamily="Inter, sans-serif">?</text>
              </svg>
            </span>
            <span className="text-8xl font-extrabold sm:text-[96px]" style={{ color: '#2A7FD4', letterSpacing: -2 }}>4</span>
          </div>

          {/* Warm divider */}
          <div
            className="mx-auto mb-6"
            style={{
              width: 140,
              height: 3,
              borderRadius: 2,
              background: 'linear-gradient(90deg, #F28C5A, #F6A97A)',
              opacity: 0.6,
            }}
          />

          {/* Error message */}
          <h1 className="text-2xl font-bold sm:text-[26px]" style={{ color: '#3D2E1E' }}>
            Oups ! Page introuvable
          </h1>

          <p className="mx-auto mt-3 max-w-md text-base" style={{ color: '#9A8A7B' }}>
            La page que vous recherchez n{"'"}existe pas ou a été déplacée.
          </p>
          <p className="mx-auto mt-1 max-w-md text-[15px]" style={{ color: '#9A8A7B' }}>
            Pas de panique, nous allons vous aider à retrouver votre chemin.
          </p>

          {/* CTA Button — pill-shaped, warm gradient */}
          <div className="mt-8">
            <Link
              href="/login"
              className="inline-flex items-center justify-center font-semibold text-white transition-opacity hover:opacity-90"
              style={{
                height: 52,
                paddingInline: 40,
                borderRadius: 26,
                background: 'linear-gradient(135deg, #F28C5A, #E87840)',
                fontSize: 16,
                boxShadow: '0 4px 16px rgba(242, 140, 90, 0.3)',
              }}
            >
              Retour à l{"'"}accueil
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-sm" style={{ color: '#C4B5A8' }}>
          Link{"'"}s Accompagnement — Plateforme de suivi des bilans de compétences
        </p>
      </footer>
    </div>
  )
}
