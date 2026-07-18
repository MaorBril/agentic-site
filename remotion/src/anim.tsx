import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { theme } from './theme';

/**
 * Reveals `text` character-by-character between startFrame and startFrame+duration.
 * Frame-driven (deterministic). Shows a blinking caret while typing.
 */
export const Typewriter: React.FC<{
  text: string;
  startFrame: number;
  duration: number;
  caret?: boolean;
  color?: string;
}> = ({ text, startFrame, duration, caret = true, color = theme.text }) => {
  const frame = useCurrentFrame();
  const chars = Math.round(
    interpolate(frame, [startFrame, startFrame + duration], [0, text.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const done = chars >= text.length;
  const showCaret = caret && frame >= startFrame && (!done || frame % 30 < 15);

  return (
    <span style={{ color }}>
      {text.slice(0, chars)}
      {showCaret && (
        <span
          style={{
            display: 'inline-block',
            width: 11,
            height: 24,
            backgroundColor: theme.accent,
            marginLeft: 2,
            transform: 'translateY(3px)',
          }}
        />
      )}
    </span>
  );
};

/** Fade + rise in over `dur` frames starting at `at`. */
export const FadeUp: React.FC<{
  at: number;
  dur?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ at, dur = 12, children, style }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const y = interpolate(frame, [at, at + dur], [10, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div style={{ opacity: o, transform: `translateY(${y}px)`, ...style }}>
      {children}
    </div>
  );
};
