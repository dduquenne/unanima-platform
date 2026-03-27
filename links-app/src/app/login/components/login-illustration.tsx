'use client'

export function LoginIllustration() {
  return (
    <svg
      viewBox="0 0 460 280"
      className="w-full max-w-[400px]"
      aria-hidden="true"
    >
      {/* Concentric circles */}
      <circle cx="230" cy="120" r="150" fill="none" stroke="#FFFFFF" strokeWidth={0.8} opacity={0.1} />
      <circle cx="230" cy="120" r="100" fill="none" stroke="#FFFFFF" strokeWidth={0.5} opacity={0.08} />

      {/* Abstract person 1 — seated */}
      <g opacity={0.35} transform="translate(80, 40)">
        <circle cx="20" cy="0" r="16" fill="#F28C5A" />
        <path d="M0,20 Q0,40 10,50 L30,50 Q40,40 40,20 Z" fill="#F28C5A" />
        <rect x="5" y="50" width="30" height="25" rx="6" fill="#FFFFFF" opacity={0.4} />
      </g>

      {/* Abstract person 2 — standing */}
      <g opacity={0.3} transform="translate(200, 20)">
        <circle cx="20" cy="0" r="18" fill="#A8C8F0" />
        <path d="M0,22 Q0,45 12,55 L28,55 Q40,45 40,22 Z" fill="#A8C8F0" />
        <rect x="8" y="55" width="24" height="30" rx="5" fill="#FFFFFF" opacity={0.3} />
      </g>

      {/* Abstract person 3 */}
      <g opacity={0.25} transform="translate(320, 60)">
        <circle cx="18" cy="0" r="15" fill="#FFFFFF" />
        <path d="M2,18 Q2,38 10,46 L26,46 Q34,38 34,18 Z" fill="#FFFFFF" />
      </g>

      {/* Connection lines (dashed) */}
      <line x1="120" y1="60" x2="200" y2="40" stroke="#F28C5A" strokeWidth={1.5} opacity={0.25} strokeDasharray="4,4" />
      <line x1="240" y1="50" x2="320" y2="75" stroke="#A8C8F0" strokeWidth={1.5} opacity={0.2} strokeDasharray="4,4" />

      {/* Floating dots */}
      <circle cx="160" cy="30" r="4" fill="#F28C5A" opacity={0.5} />
      <circle cx="280" cy="50" r="3" fill="#FFFFFF" opacity={0.3} />
      <circle cx="140" cy="100" r="3" fill="#A8C8F0" opacity={0.4} />
      <circle cx="350" cy="40" r="3" fill="#F28C5A" opacity={0.3} />
      <circle cx="60" cy="90" r="3.5" fill="#FFFFFF" opacity={0.25} />
      <circle cx="250" cy="140" r="4" fill="#F28C5A" opacity={0.3} />
    </svg>
  )
}
