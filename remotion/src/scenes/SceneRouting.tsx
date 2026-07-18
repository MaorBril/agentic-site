import React from 'react';
import { TerminalWindow, Prompt } from '../Terminal';
import { Typewriter, FadeUp } from '../anim';
import { theme } from '../theme';

/** Scene 2: dynamic routing — a classifier picks a model per task. */
export const SceneRouting: React.FC = () => {
  return (
    <TerminalWindow title="agentic — dynamic routing">
      <div style={{ display: 'flex', gap: 12, fontSize: 24, lineHeight: 1.7 }}>
        <span style={{ color: theme.accent }}>❯</span>
        <Typewriter text="agentic --model auto" startFrame={6} duration={26} />
      </div>

      <FadeUp at={40} style={{ marginTop: 24 }}>
        <div style={{ fontSize: 17, color: theme.faint, marginBottom: 10 }}>
          a cheap classifier triages every task →
        </div>
      </FadeUp>

      <Row at={50} tier="deep" task="plan the migration" model="opus" color={theme.accentSoft} />
      <Row at={62} tier="standard" task="write the handler" model="sonnet" color={theme.cyan} />
      <Row at={74} tier="light" task="rename + run tests" model="qwen" color={theme.green} />

      <FadeUp at={90} style={{ marginTop: 24 }}>
        <div
          style={{
            fontSize: 18,
            color: theme.faint,
            borderLeft: `2px solid ${theme.accent}`,
            paddingLeft: 14,
          }}
        >
          hard work on a big model. mechanical work on a cheap one.
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
}> = ({ at, tier, task, model, color }) => (
  <FadeUp at={at}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        fontSize: 19,
        lineHeight: 2.0,
      }}
    >
      <span
        style={{
          color,
          minWidth: 92,
          fontSize: 14,
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
