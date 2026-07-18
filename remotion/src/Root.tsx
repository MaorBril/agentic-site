import React from 'react';
import { Composition } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { AbsoluteFill } from 'remotion';
import { VIDEO } from './theme';
import { SceneLaunch } from './scenes/SceneLaunch';
import { SceneRouting } from './scenes/SceneRouting';
import { SceneCost } from './scenes/SceneCost';
import { SceneBrand } from './scenes/SceneBrand';

// Scene durations (frames @30fps) and the cross-fade length between them.
const D = { launch: 100, routing: 120, cost: 105, brand: 95 };
const T = 18; // transition frames

// Total timeline = sum of scenes minus the overlaps consumed by transitions.
export const HERO_DURATION =
  D.launch + D.routing + D.cost + D.brand - 3 * T;

const Hero: React.FC = () => (
  <AbsoluteFill>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={D.launch}>
        <SceneLaunch />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: T })}
      />
      <TransitionSeries.Sequence durationInFrames={D.routing}>
        <SceneRouting />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: T })}
      />
      <TransitionSeries.Sequence durationInFrames={D.cost}>
        <SceneCost />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: T })}
      />
      <TransitionSeries.Sequence durationInFrames={D.brand}>
        <SceneBrand />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Hero"
      component={Hero}
      durationInFrames={HERO_DURATION}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
  );
};
