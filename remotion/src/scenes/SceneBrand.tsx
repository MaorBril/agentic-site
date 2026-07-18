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
  const lineO = interpolate(frame, [18, 34], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const installO = interpolate(frame, [34, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

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
          position: 'absolute',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.accent}2e 0%, transparent 60%)`,
          filter: 'blur(30px)',
        }}
      />
      <div
        style={{
          transform: `scale(${0.85 + pop * 0.15})`,
          opacity: pop,
          fontFamily: theme.mono,
          fontSize: 88,
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
          marginTop: 20,
          fontSize: 30,
          color: theme.dim,
          textAlign: 'center',
        }}
      >
        Run Claude Code on any model, with a budget.
      </div>

      <div
        style={{
          opacity: installO,
          marginTop: 40,
          fontFamily: theme.mono,
          fontSize: 19,
          color: theme.accentSoft,
          padding: '14px 26px',
          border: `1px solid ${theme.panelBorder}`,
          borderRadius: 10,
          backgroundColor: theme.panel,
        }}
      >
        curl -fsSL https://raw.githubusercontent.com/maorbril/agentic/main/install.sh | sh
      </div>
    </AbsoluteFill>
  );
};
