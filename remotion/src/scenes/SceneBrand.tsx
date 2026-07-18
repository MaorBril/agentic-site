import React from 'react';
import { AbsoluteFill, useCurrentFrame, spring, interpolate } from 'remotion';
import { theme, VIDEO } from '../theme';

/** Scene 4: brand card — logo mark, tagline, install line. */
export const SceneBrand: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = spring({
    frame,
    fps: VIDEO.fps,
    config: { damping: 14, mass: 0.8, stiffness: 120 },
  });
  const lineO = interpolate(frame, [16, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const installO = interpolate(frame, [30, 44], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // cursor blink keeps the closing frame from ever reading as a static export
  const caretOn = frame % 26 < 14;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: theme.sans,
      }}
    >
      <div
        style={{
          transform: `scale(${0.85 + pop * 0.15})`,
          opacity: pop,
          fontFamily: theme.mono,
          fontSize: 84,
          fontWeight: 700,
          color: theme.text,
          letterSpacing: -2,
        }}
      >
        <span style={{ color: theme.accent }}>❯</span> agentic
      </div>

      <div
        style={{
          opacity: lineO,
          marginTop: 18,
          fontSize: 26,
          color: theme.dim,
          textAlign: 'center',
        }}
      >
        Claude Code, on any model, with a budget.
      </div>

      <div
        style={{
          opacity: installO,
          marginTop: 36,
          fontFamily: theme.mono,
          fontSize: 18,
          color: theme.accentSoft,
          padding: '13px 24px',
          border: `1px solid ${theme.panelBorder}`,
          borderRadius: 8,
          backgroundColor: theme.panel,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span>curl -fsSL raw.githubusercontent.com/maorbril/agentic/main/install.sh | sh</span>
        {frame > 34 && (
          <span
            style={{
              width: 8,
              height: 18,
              backgroundColor: theme.accent,
              opacity: caretOn ? 1 : 0,
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};
