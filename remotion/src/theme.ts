/**
 * Design system for Remotion video — aligned with app/globals.css (dark mode).
 * Use rgb(...) when applying, e.g. rgb(theme.background).
 */
export const theme = {
  background: '18, 18, 20',
  foreground: '244, 244, 245',
  card: '24, 24, 27',
  cardForeground: '244, 244, 245',
  border: '39, 39, 42',
  primary: '20, 184, 166',
  primaryForeground: '18, 18, 20',
  muted: '39, 39, 42',
  mutedForeground: '161, 161, 170',
  success: '34, 197, 94',
  warning: '234, 179, 8',
  error: '220, 80, 80',
} as const

export function rgb(key: keyof typeof theme): string {
  return `rgb(${theme[key]})`
}
