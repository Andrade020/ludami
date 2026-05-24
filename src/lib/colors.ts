export const AREA_COLORS = [
  '#FF6B6B',
  '#FF8E53',
  '#06D6A0',
  '#118AB2',
  '#9B5DE5',
  '#F15BB5',
  '#00BBF9',
  '#FFD166',
]

export const AVATAR_COLORS = [
  '#FF6B6B',
  '#06D6A0',
  '#9B5DE5',
  '#00BBF9',
  '#F15BB5',
  '#FFD166',
]

export function colorToShadow(hex: string, alpha = 0.4): string {
  return `0 4px 20px ${hex}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`
}

export function randomAreaColor(): string {
  return AREA_COLORS[Math.floor(Math.random() * AREA_COLORS.length)]
}

export function randomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
}
