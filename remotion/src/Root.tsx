import React from 'react';
import { Composition } from 'remotion';
import { VIDEO } from './theme';
import { SceneDemo, DEMO_DURATION } from './scenes/SceneDemo';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Hero"
      component={SceneDemo}
      durationInFrames={DEMO_DURATION}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
  );
};

