'use client'

export function LoginIllustration() {
  return (
    <svg
      viewBox="-200 -200 400 400"
      className="w-full max-w-[340px]"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ill-grad-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.15} />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.03} />
        </linearGradient>
        <linearGradient id="ill-grad-path" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity={0.6} />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.15} />
        </linearGradient>
      </defs>

      {/* Anneaux concentriques */}
      <circle cx="0" cy="0" r="160" fill="none" stroke="url(#ill-grad-ring)" strokeWidth={1} />
      <circle cx="0" cy="0" r="120" fill="none" stroke="url(#ill-grad-ring)" strokeWidth={1.2} />
      <circle cx="0" cy="0" r="80" fill="none" stroke="url(#ill-grad-ring)" strokeWidth={1.5} />

      {/* Chemin courbe principal */}
      <path
        d="M -140 60 Q -80 -40, 0 -20 T 140 -60"
        fill="none"
        stroke="url(#ill-grad-path)"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <path
        d="M -120 100 Q -40 20, 40 40 T 160 0"
        fill="none"
        stroke="var(--color-secondary)"
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.3}
      />

      {/* Points d'étape — cyan */}
      <circle cx="-140" cy="60" r="12" fill="var(--color-secondary)" opacity={0.15} />
      <circle cx="-140" cy="60" r="6" fill="var(--color-secondary)" opacity={0.8} />

      {/* Points d'étape — bleu */}
      <circle cx="0" cy="-20" r="16" fill="var(--color-primary)" opacity={0.12} />
      <circle cx="0" cy="-20" r="8" fill="var(--color-primary)" />

      {/* Points d'étape — orange */}
      <circle cx="140" cy="-60" r="14" fill="var(--color-accent)" opacity={0.15} />
      <circle cx="140" cy="-60" r="7" fill="var(--color-accent)" opacity={0.9} />

      {/* Connexions entre points */}
      <line x1="-80" y1="-10" x2="-40" y2="-20" stroke="#FFFFFF" strokeWidth={0.5} opacity={0.12} />
      <line x1="40" y1="-30" x2="90" y2="-50" stroke="#FFFFFF" strokeWidth={0.5} opacity={0.12} />

      {/* Losange */}
      <g transform="translate(-60, -100) rotate(45)">
        <rect x="-10" y="-10" width="20" height="20" rx="3" fill="none" stroke="var(--color-secondary)" strokeWidth={1.2} opacity={0.4} />
      </g>

      {/* Triangle */}
      <polygon points="100,80 115,105 85,105" fill="none" stroke="var(--color-accent)" strokeWidth={1.2} opacity={0.3} />

      {/* Petits cercles */}
      <circle cx="-160" cy="-60" r="4" fill="#FFFFFF" opacity={0.15} />
      <circle cx="170" cy="40" r="3" fill="var(--color-secondary)" opacity={0.3} />

      {/* Croix */}
      <g transform="translate(60, 120)" opacity={0.2}>
        <line x1="-6" y1="0" x2="6" y2="0" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" />
        <line x1="0" y1="-6" x2="0" y2="6" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" />
      </g>
    </svg>
  )
}
