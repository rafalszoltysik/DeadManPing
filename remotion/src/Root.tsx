import React from 'react'
import { Composition } from 'remotion'
import { DeadManPing30 } from './Compositions/DeadManPing30'
import { DURATION_FRAMES, FPS } from './utils/timing'

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DeadManPing30"
        component={DeadManPing30}
        durationInFrames={DURATION_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="DeadManPing30Vertical"
        component={DeadManPing30}
        durationInFrames={DURATION_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="DeadManPing30Square"
        component={DeadManPing30}
        durationInFrames={DURATION_FRAMES}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{}}
      />
    </>
  )
}
