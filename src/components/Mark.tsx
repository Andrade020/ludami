interface Props {
  size?: number
  ink?: string
  accent?: string
  mono?: boolean
  inherit?: boolean
  className?: string
  style?: React.CSSProperties
}

export default function Mark({
  size = 32,
  ink,
  accent,
  mono = false,
  inherit = false,
  className,
  style,
}: Props) {
  const a = inherit ? 'currentColor' : (mono ? (ink ?? 'currentColor') : (accent ?? 'var(--accent)'))
  const b = inherit ? 'currentColor' : (ink ?? 'var(--fg)')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ display: 'block', flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      <path d="M 12 36 Q 28 20 44 36 T 76 36"
            stroke={a} strokeWidth="5" fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 12 64 Q 28 80 44 64 T 76 64"
            stroke={b} strokeWidth="11" fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
