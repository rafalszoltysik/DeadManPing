import { useVideoConfig } from 'remotion'

/** True when composition is vertical (9:16) or square — use mobile layout. */
export function useIsVertical(): boolean {
  const { width, height } = useVideoConfig()
  if (typeof width !== 'number' || typeof height !== 'number') return false
  return height >= width
}

export function useDimensions(): { width: number; height: number } {
  const { width, height } = useVideoConfig()
  return { width, height }
}
