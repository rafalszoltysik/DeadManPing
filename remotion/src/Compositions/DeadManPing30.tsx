import React from 'react'
import { AbsoluteFill, Audio, interpolate, Sequence, useCurrentFrame, staticFile } from 'remotion'
import { theme } from '../theme'
import {
  CROSSFADE_FRAMES,
  DURATION_FRAMES,
  SCENE_1_END,
  SCENE_2_END,
  SCENE_3_END,
  SCENE_4_END,
  SCENE_ENDS,
  SCENE_STARTS,
} from '../utils/timing'
import { Scene1Hook } from '../scenes/Scene1Hook'
import { Scene2Problem } from '../scenes/Scene2Problem'
import { Scene3Solution } from '../scenes/Scene3Solution'
import { Scene4Dashboard } from '../scenes/Scene4Dashboard'
import { Scene5CTA } from '../scenes/Scene5CTA'

function sceneOpacity(sceneIndex: number, frame: number): number {
  const start = SCENE_STARTS[sceneIndex]
  const end = SCENE_ENDS[sceneIndex]
  const fadeIn =
    frame <= start
      ? 1
      : interpolate(frame, [start, start + CROSSFADE_FRAMES], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
  const fadeOut =
    end >= DURATION_FRAMES
      ? 1
      : interpolate(frame, [end - CROSSFADE_FRAMES, end], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
  return fadeIn * fadeOut
}

export const DeadManPing30: React.FC = () => {
  const frame = useCurrentFrame()

  return (
    <AbsoluteFill style={{ backgroundColor: `rgb(${theme.background})` }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Sequence key={i} from={SCENE_STARTS[i - 1]} name={`VO ${i}`} layout="none">
          {/* @ts-expect-error Remotion Audio Pick<> type includes optional HTML props */}
          <Audio src={staticFile(`scene${i}.mp3`)} />
        </Sequence>
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <AbsoluteFill
          key={i}
          style={{
            opacity: sceneOpacity(i, frame),
            pointerEvents: 'none',
          }}
        >
          {i === 0 && <Scene1Hook frame={frame - SCENE_STARTS[0]} fps={30} />}
          {i === 1 && <Scene2Problem frame={frame - SCENE_STARTS[1]} fps={30} />}
          {i === 2 && <Scene3Solution frame={frame - SCENE_STARTS[2]} fps={30} />}
          {i === 3 && <Scene4Dashboard frame={frame - SCENE_STARTS[3]} fps={30} />}
          {i === 4 && <Scene5CTA frame={frame - SCENE_STARTS[4]} fps={30} />}
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  )
}
