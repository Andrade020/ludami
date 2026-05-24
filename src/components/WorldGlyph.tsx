import type { GlyphKind } from '../lib/colors'

interface Props {
  size?: number
  palette: [string, string, string]
  kind: GlyphKind
  className?: string
  style?: React.CSSProperties
}

export default function WorldGlyph({ size = 120, palette, kind, className, style }: Props) {
  const [a, b, c] = palette
  const wrap = { width: size, height: size, display: 'block', ...style }

  if (kind === 'arch') {
    return (
      <svg viewBox="0 0 100 100" className={className} style={wrap} aria-hidden="true">
        <rect width="100" height="100" fill={a} />
        <path d="M 20 80 Q 50 20 80 80 Z" fill={b} />
        <circle cx="50" cy="62" r="6" fill={c} />
      </svg>
    )
  }
  if (kind === 'waves') {
    return (
      <svg viewBox="0 0 100 100" className={className} style={wrap} aria-hidden="true">
        <rect width="100" height="100" fill={a} />
        <path d="M 0 55 Q 25 40 50 55 T 100 55 L 100 100 L 0 100 Z" fill={b} />
        <path d="M 0 72 Q 25 60 50 72 T 100 72 L 100 100 L 0 100 Z" fill={c} opacity="0.85" />
      </svg>
    )
  }
  if (kind === 'grid') {
    return (
      <svg viewBox="0 0 100 100" className={className} style={wrap} aria-hidden="true">
        <rect width="100" height="100" fill={a} />
        <rect x="14" y="14" width="32" height="32" fill={b} />
        <rect x="54" y="14" width="32" height="32" fill={c} />
        <rect x="14" y="54" width="32" height="32" fill={c} />
        <rect x="54" y="54" width="32" height="32" fill={b} />
      </svg>
    )
  }
  if (kind === 'sun') {
    return (
      <svg viewBox="0 0 100 100" className={className} style={wrap} aria-hidden="true">
        <rect width="100" height="100" fill={a} />
        <circle cx="50" cy="58" r="22" fill={b} />
        <rect y="68" width="100" height="32" fill={c} />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 100 100" className={className} style={wrap} aria-hidden="true">
      <rect width="100" height="100" fill={a} />
      <circle cx="50" cy="50" r="14" fill={b} />
      <circle cx="50" cy="50" r="5" fill={c} />
    </svg>
  )
}
