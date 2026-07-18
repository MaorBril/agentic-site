import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { TerminalWindow } from '../Terminal';
import { Typewriter, FadeUp } from '../anim';
import { theme } from '../theme';

/** Scene 3: `agentic cost` — where did today's spend go. */
export const SceneCost: React.FC = () => {
  const frame = useCurrentFrame();
  // animate the day total counting up
  const total = interpolate(frame, [46, 78], [0, 4.31], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <TerminalWindow title="agentic cost">
      <div style={{ display: 'flex', gap: 12, fontSize: 24, lineHeight: 1.7 }}>
        <span style={{ color: theme.accent }}>❯</span>
        <Typewriter text="agentic cost --by model" startFrame={6} duration={26} />
      </div>

      <FadeUp at={42} style={{ marginTop: 26 }}>
        <Bar label="opus" value="$2.87" pct={0.66} color={theme.accentSoft} />
      </FadeUp>
      <FadeUp at={50}>
        <Bar label="sonnet" value="$1.12" pct={0.26} color={theme.cyan} />
      </FadeUp>
      <FadeUp at={58}>
        <Bar label="qwen" value="$0.32" pct={0.08} color={theme.green} />
      </FadeUp>

      <FadeUp at={72} style={{ marginTop: 24 }}>
        <div
          style={{
            fontSize: 26,
            color: theme.text,
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: `1px solid ${theme.panelBorder}`,
            paddingTop: 18,
          }}
        >
          <span style={{ color: theme.dim }}>today</span>
          <span style={{ color: theme.text }}>${total.toFixed(2)}</span>
        </div>
      </FadeUp>
    </TerminalWindow>
  );
};

const Bar: React.FC<{
  label: string;
  value: string;
  pct: number;
  color: string;
}> = ({ label, value, pct, color }) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame, [46, 76], [0, pct * 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        fontSize: 19,
        lineHeight: 2.3,
      }}
    >
      <span style={{ color: theme.dim, minWidth: 80 }}>{label}</span>
      <div
        style={{
          flex: 1,
          height: 12,
          borderRadius: 6,
          backgroundColor: '#1b1b20',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${w}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 6,
          }}
        />
      </div>
      <span style={{ color: theme.text, minWidth: 70, textAlign: 'right' }}>
        {value}
      </span>
    </div>
  );
};
