interface Props {
  size?: number
  color?: string
  className?: string
  style?: React.CSSProperties
}

export default function Wordmark({ size = 28, color, className, style }: Props) {
  return (
    <span
      className={className}
      style={{
        fontFamily: "'Instrument Serif', Georgia, serif",
        fontStyle: 'italic',
        fontWeight: 400,
        fontSize: size,
        color: color ?? 'var(--fg)',
        lineHeight: 1,
        letterSpacing: '-0.015em',
        display: 'inline-block',
        ...style,
      }}
    >ludami</span>
  )
}
