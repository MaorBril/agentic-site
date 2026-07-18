import React from 'react';
import { useCurrentFrame } from 'remotion';
import { TerminalWindow } from '../Terminal';
import { Typewriter, FadeUp } from '../anim';
import { theme } from '../theme';

const ROWS = [
  { tier: 'deep', task: 'plan the migration', model: 'opus', color: theme.accentSoft },
  { tier: 'standard', task: 'write the handler', model: 'sonnet', color: theme.cyan },
  { tier: 'light', task: 'rename + run tests', model: 'qwen', color: theme.green },
];

/** Scene 2: dynamic routing — a classifier picks a model per task. */
export const SceneRouting: React.FC = () => {
  const frame = useCurrentFrame();
  // After all three rows land (~frame 86), a highlight sweeps through them
  // on a loop so the frame never sits still.
  const cycle = Math.floor(Math.max(0, frame - 86) / 24) % ROWS.length;

  return (
    <TerminalWindow title="agentic — dynamic routing">
      <div style={{ display: 'flex', gap: 12, fontSize: 24, lineHeight: 1.7 }}>
        <span style={{ color: theme.accent }}>❯</span>
        <Typewriter text="agentic --model auto" startFrame={4} duration={22} />
      </div>

      <FadeUp at={32} style={{ marginTop: 22 }}>
        <div style={{ fontSize: 16, color: theme.faint, marginBottom: 8 }}>
          a cheap classifier triages every task
        </div>
      </FadeUp>

      {ROWS.map((r, i) => (
        <Row
          key={r.tier}
          at={42 + i * 14}
          {...r}
          active={frame >= 86 && cycle === i}
        />
      ))}

      <FadeUp at={96} style={{ marginTop: 22 }}>
        <div
          style={{
            fontSize: 16,
            color: theme.faint,
            borderLeft: `2px solid ${theme.accent}`,
            paddingLeft: 14,
          }}
        >
          hard work on a big model, mechanical work on a cheap one
        </div>
      </FadeUp>
    </TerminalWindow>
  );
};

const Row: React.FC<{
  at: number;
  tier: string;
  task: string;
  model: string;
  color: string;
  active: boolean;
}> = ({ at, tier, task, model, color, active }) => (
  <FadeUp at={at}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        fontSize: 18,
        lineHeight: 2.1,
        borderRadius: 6,
        padding: '2px 8px',
        marginLeft: -8,
        backgroundColor: active ? `${color}14` : 'transparent',
        transition: 'background-color 0.1s',
      }}
    >
      <span
        style={{
          color,
          minWidth: 88,
          fontSize: 13,
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        {tier}
      </span>
      <span style={{ color: theme.dim }}>“{task}”</span>
      <span style={{ color: theme.faint }}>→</span>
      <span style={{ color }}>{model}</span>
    </div>
  </FadeUp>
);
