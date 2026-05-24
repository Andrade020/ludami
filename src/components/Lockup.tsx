import Mark from './Mark'
import Wordmark from './Wordmark'

interface Props {
  orientation?: 'h' | 'v'
  markSize?: number
  wordSize?: number
  ink?: string
  accent?: string
  className?: string
}

export default function Lockup({
  orientation = 'h',
  markSize = 28,
  wordSize,
  ink,
  accent,
  className,
}: Props) {
  const ws = wordSize ?? (orientation === 'h' ? Math.round(markSize * 1.15) : Math.round(markSize * 0.6))
  if (orientation === 'v') {
    return (
      <div
        className={className}
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: markSize * 0.2,
        }}
      >
        <Mark size={markSize} ink={ink} accent={accent} />
        <Wordmark size={ws} color={ink} />
      </div>
    )
  }
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: markSize * 0.32,
      }}
    >
      <Mark size={markSize} ink={ink} accent={accent} />
      <Wordmark size={ws} color={ink} />
    </span>
  )
}
