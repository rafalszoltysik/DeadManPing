/**
 * Timeline: 30 s at 30 fps = 900 frames.
 * Scene boundaries (start frame inclusive, end frame exclusive).
 */
export const FPS = 30
export const DURATION_FRAMES = 900

export const SCENE_1_END = 120   // 0–4 s   Hook
export const SCENE_2_END = 210   // 4–7 s   Problem
export const SCENE_3_END = 360   // 7–12 s  Solution
export const SCENE_4_END = 600   // 12–20 s Dashboard
export const SCENE_5_END = 900   // 20–30 s CTA

export const SCENE_STARTS = [0, SCENE_1_END, SCENE_2_END, SCENE_3_END, SCENE_4_END] as const
export const SCENE_ENDS = [SCENE_1_END, SCENE_2_END, SCENE_3_END, SCENE_4_END, SCENE_5_END] as const

export function getSceneIndex(frame: number): number {
  if (frame < SCENE_1_END) return 0
  if (frame < SCENE_2_END) return 1
  if (frame < SCENE_3_END) return 2
  if (frame < SCENE_4_END) return 3
  return 4
}

export function getSceneFrame(frame: number): number {
  const idx = getSceneIndex(frame)
  return frame - SCENE_STARTS[idx]
}

export function getSceneDuration(sceneIndex: number): number {
  return SCENE_ENDS[sceneIndex] - SCENE_STARTS[sceneIndex]
}

/** Długość crossfade między scenami (w klatkach). */
export const CROSSFADE_FRAMES = 18
