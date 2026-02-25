import { interpolate } from 'remotion'

/**
 * Linear fade in over first N frames.
 */
export function fadeIn(frame: number, durationFrames: number): number {
  return interpolate(frame, [0, durationFrames], [0, 1], { extrapolateRight: 'clamp' })
}

/**
 * Fade out over last N frames.
 */
export function fadeOut(frame: number, sceneDuration: number, durationFrames: number): number {
  return interpolate(
    frame,
    [sceneDuration - durationFrames, sceneDuration],
    [1, 0],
    { extrapolateLeft: 'clamp' }
  )
}

/**
 * Slide up (from 50px to 0).
 */
export function slideUp(frame: number, durationFrames: number, fromPx: number = 50): number {
  return interpolate(frame, [0, durationFrames], [fromPx, 0], { extrapolateRight: 'clamp' })
}

/**
 * Stagger: delay start so element fades in after delay frames.
 */
export function staggerFade(
  frame: number,
  delayFrames: number,
  fadeDurationFrames: number
): number {
  const start = delayFrames
  return interpolate(frame, [start, start + fadeDurationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
}
