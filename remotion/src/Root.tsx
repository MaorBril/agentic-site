import React from 'react';
import { Composition } from 'remotion';
import { VIDEO } from './theme';
import { HeroContext, HERO_CONTEXT_DURATION } from './scenes/HeroContext';
import { EvalPaired, EVAL_PAIRED_DURATION } from './scenes/EvalPaired';

/**
 * Durations live in the scene modules and poster frames in `posters.mjs`, so
 * the render scripts, the HTML and the compositions can never disagree about
 * which frame is the poster.
 *
 * Output names are versioned (`hero-context-v2`, `eval-paired-v1`) because the
 * Netlify config serves versioned media as immutable for a year — a render
 * must never overwrite a name a returning visitor may already have cached.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Primary hero: size-aware routing + virtual context scaling. */}
      <Composition
        id="HeroContext"
        component={HeroContext}
        durationInFrames={HERO_CONTEXT_DURATION}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />

      {/* Sectional: paired, blinded eval harness. */}
      <Composition
        id="EvalPaired"
        component={EvalPaired}
        durationInFrames={EVAL_PAIRED_DURATION}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
    </>
  );
};
