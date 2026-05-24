import type { Area } from './types'

export const BRAND = {
  cream: '#f3ead8',
  ink:   '#1a1612',
  terra: '#c8624a',
  amber: '#d4a574',
  moss:  '#7a8f6b',
} as const

export const WORLD_PALETTES: [string, string, string][] = [
  ['#c8624a', '#d4a574', '#1a1612'],
  ['#1a1612', '#c8624a', '#d4a574'],
  ['#7a8f6b', '#f3ead8', '#1a1612'],
  ['#d4a574', '#c8624a', '#1a1612'],
  ['#436b6e', '#c9a86f', '#f3ead8'],
  ['#a8543d', '#5b6b5a', '#f3ead8'],
  ['#5b6b5a', '#d4a574', '#f3ead8'],
  ['#b85b3e', '#ebe5d9', '#2d2722'],
]

export const GLYPH_KINDS = ['arch', 'waves', 'grid', 'sun', 'dot'] as const
export type GlyphKind = typeof GLYPH_KINDS[number]

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0
  return Math.abs(h)
}

export interface WorldIdentity {
  palette: [string, string, string]
  kind: GlyphKind
}

export function deriveWorld(area: Pick<Area, 'id' | 'color'>): WorldIdentity {
  const h = hashId(area.id)
  const kind = GLYPH_KINDS[h % GLYPH_KINDS.length]

  const matched = WORLD_PALETTES.find(p => p[0].toLowerCase() === area.color.toLowerCase())
  if (matched) return { palette: matched, kind }

  const accents = [BRAND.amber, BRAND.moss, BRAND.terra, BRAND.cream]
  const a2 = accents[h % accents.length]
  const a3 = h % 2 === 0 ? BRAND.ink : BRAND.cream
  return { palette: [area.color, a2, a3], kind }
}

export const AREA_COLORS = WORLD_PALETTES.map(p => p[0])
export const AVATAR_COLORS = [
  BRAND.terra, BRAND.amber, BRAND.moss, '#436b6e', '#b85b3e', '#a8543d',
]

export function randomAreaColor(): string {
  return AREA_COLORS[Math.floor(Math.random() * AREA_COLORS.length)]
}

export function randomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
}

export function colorToShadow(hex: string, alpha = 0.25): string {
  return `0 4px 20px ${hex}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`
}
