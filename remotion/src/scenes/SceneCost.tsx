import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { TerminalWindow } from '../Terminal';
import { Typewriter, FadeUp } from '../anim';
import { theme } from '../theme';

/** Scene 3: `agentic cost` — where did today's spend go. */
export const SceneCost: React.FC = () => {
  const frame = useCurrentFrame();
  const total = interpolate(frame, [40, 66], [0, 4.31], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // a slow, tiny monotonic tick-up after landing — spend never stops accruing
  const tick = frame > 66 ? (frame - 66) * 0.00015 : 0;

  const pulse = 0.4 + 0.6 * Math.abs(Math.sin(frame / 10));

  return (
    <TerminalWindow title="agentic cost">
      <div style={{ display: 'flex', gap: 12, fontSize: 24, lineHeight: 1.7 }}>
        <span style={{ color: theme.accent }}>❯</span>
        <Typewriter text="agentic cost --by model" startFrame={4} duration={22} />
      </div>

      <FadeUp at={36} style={{ marginTop: 24 }}>
        <Bar label="opus" value="$2.87" pct={0.66} color={theme.accentSoft} />
      </FadeUp>
      <FadeUp at={44}>
        <Bar label="sonnet" value="$1.12" pct={0.26} color={theme.cyan} />
      </FadeUp>
      <FadeUp at={52}>
        <Bar label="qwen" value="$0.32" pct={0.08} color={theme.green} />
      </FadeUp>

      <FadeUp at={64} style={{ marginTop: 22 }}>
        <div
          style={{
            fontSize: 24,
            color: theme.text,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: `1px solid ${theme.panelBorder}`,
            paddingTop: 16,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 9, color: theme.dim }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: theme.green,
                opacity: pulse,
                display: 'inline-block',
              }}
            />
            metering live
          </span>
          <span style={{ color: theme.text }}>${(total + tick).toFixed(2)}</span>
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
  const w = interpolate(frame, [36, 62], [0, pct * 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        fontSize: 18,
        lineHeight: 2.2,
      }}
    >
      <span style={{ color: theme.dim, minWidth: 76 }}>{label}</span>
      <div
        style={{
          flex: 1,
          height: 11,
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
      <span style={{ color: theme.text, minWidth: 68, textAlign: 'right' }}>
        {value}
      </span>
    </div>
  );
};
