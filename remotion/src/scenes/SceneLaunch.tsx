import React from 'react';
import { useCurrentFrame } from 'remotion';
import { TerminalWindow } from '../Terminal';
import { Typewriter, FadeUp } from '../anim';
import { theme } from '../theme';

/** Scene 1: `agentic` launches Claude Code, router picks a model. */
export const SceneLaunch: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <TerminalWindow title="agentic — Claude Code, on any model">
      <div style={{ display: 'flex', gap: 12, fontSize: 24, lineHeight: 1.7 }}>
        <span style={{ color: theme.accent }}>❯</span>
        <Typewriter text="agentic" startFrame={6} duration={18} />
      </div>

      <FadeUp at={34} style={{ marginTop: 22 }}>
        <div style={{ fontSize: 20, color: theme.dim, lineHeight: 1.9 }}>
          <span style={{ color: theme.green }}>✓</span> router ready ·{' '}
          <span style={{ color: theme.accentSoft }}>127.0.0.1:41100</span>
        </div>
      </FadeUp>
      <FadeUp at={44}>
        <div style={{ fontSize: 20, color: theme.dim, lineHeight: 1.9 }}>
          <span style={{ color: theme.green }}>✓</span> profile{' '}
          <span style={{ color: theme.text }}>main</span> · model{' '}
          <span style={{ color: theme.cyan }}>sonnet</span>
        </div>
      </FadeUp>
      <FadeUp at={56}>
        <div style={{ fontSize: 20, color: theme.dim, lineHeight: 1.9 }}>
          <span style={{ color: theme.green }}>✓</span> launching Claude Code…
        </div>
      </FadeUp>

      <FadeUp at={72} style={{ marginTop: 26 }}>
        <div
          style={{
            fontSize: 18,
            color: theme.faint,
            borderLeft: `2px solid ${theme.accent}`,
            paddingLeft: 14,
          }}
        >
          same TUI. same tools. metered every token.
        </div>
      </FadeUp>
    </TerminalWindow>
  );
};
