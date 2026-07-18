import React from 'react';
import { useCurrentFrame } from 'remotion';
import { TerminalWindow } from '../Terminal';
import { Typewriter, FadeUp } from '../anim';
import { theme } from '../theme';

/** Scene 1: `agentic` launches Claude Code, router picks a model. */
export const SceneLaunch: React.FC = () => {
  const frame = useCurrentFrame();
  const showSpinner = frame >= 56 && frame < 72;
  const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧'];
  const spinnerChar = spinnerFrames[Math.floor(frame / 2) % spinnerFrames.length];

  return (
    <TerminalWindow title="agentic — Claude Code, on any model">
      <div style={{ display: 'flex', gap: 12, fontSize: 24, lineHeight: 1.7 }}>
        <span style={{ color: theme.accent }}>❯</span>
        <Typewriter text="agentic" startFrame={4} duration={16} />
      </div>

      <FadeUp at={30} style={{ marginTop: 22 }}>
        <div style={{ fontSize: 20, color: theme.dim, lineHeight: 1.9 }}>
          <span style={{ color: theme.green }}>✓</span> router ready ·{' '}
          <span style={{ color: theme.accentSoft }}>127.0.0.1:41100</span>
        </div>
      </FadeUp>
      <FadeUp at={40}>
        <div style={{ fontSize: 20, color: theme.dim, lineHeight: 1.9 }}>
          <span style={{ color: theme.green }}>✓</span> profile{' '}
          <span style={{ color: theme.text }}>main</span> · model{' '}
          <span style={{ color: theme.cyan }}>sonnet</span>
        </div>
      </FadeUp>
      <FadeUp at={50}>
        <div style={{ fontSize: 20, color: theme.dim, lineHeight: 1.9 }}>
          {showSpinner ? (
            <span style={{ color: theme.accentSoft, width: 14, display: 'inline-block' }}>
              {spinnerChar}
            </span>
          ) : (
            <span style={{ color: theme.green }}>✓</span>
          )}{' '}
          launching Claude Code
          {frame < 72 && '…'}
        </div>
      </FadeUp>

      <FadeUp at={76} style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', gap: 12, fontSize: 22 }}>
          <span style={{ color: theme.accent }}>❯</span>
          <Typewriter text="fix the flaky auth test" startFrame={80} duration={20} />
        </div>
      </FadeUp>
    </TerminalWindow>
  );
};
