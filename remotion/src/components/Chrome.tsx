import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { theme } from '../theme';
import { easeOut, Sep } from './TerminalPanel';

/**
 * A classifier / decision chip: an uppercase tag, then a resolving value.
 * The value reads "classifying…" until `resolveAt`, so the resolution is a
 * legible state change rather than a colour swap.
 */
export const DecisionChip: React.FC<{
  tag: string;
  value: string;
  note?: string;
  color: string;
  resolveAt?: number;
  marginTop?: number;
}> = ({ tag, value, note, color, resolveAt = 12, marginTop = 10 }) => {
  const frame = useCurrentFrame();
  const resolved = frame >= resolveAt;

  return (
    <div
      style={{
        marginTop,
        opacity: interpolate(frame, [0, 10], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: easeOut,
        }),
        translate: `0px ${interpolate(frame, [0, 10], [6, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: easeOut,
        })}px`,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 15,
      }}
    >
      <Tag color={color}>{tag}</Tag>
      <span style={{ color: theme.faint }}>→</span>
      <span style={{ color: resolved ? color : theme.faint }}>
        {resolved ? value : 'classifying…'}
      </span>
      {note && <span style={{ color: theme.faint, fontSize: 14 }}>· {note}</span>}
    </div>
  );
};

/** Bordered uppercase tag. Used for tiers, lanes and badges. */
export const Tag: React.FC<{
  color: string;
  children: React.ReactNode;
  fontSize?: number;
}> = ({ color, children, fontSize = 12 }) => (
  <span
    style={{
      color,
      border: `1px solid ${color}55`,
      backgroundColor: `${color}14`,
      borderRadius: 6,
      padding: '3px 9px',
      textTransform: 'uppercase',
      letterSpacing: 1,
      fontSize,
    }}
  >
    {children}
  </span>
);

/** Staggered output lines, each with a leading glyph. */
export const ResultLines: React.FC<{
  lines: { icon: string; text: string; muted?: boolean }[];
  color: string;
  stagger?: number;
  marginTop?: number;
}> = ({ lines, color, stagger = 12, marginTop = 8 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ marginTop }}>
      {lines.map((l, i) => (
        <div
          key={l.text}
          style={{
            opacity: interpolate(
              frame,
              [i * stagger, i * stagger + 10],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            ),
            fontSize: 17,
            lineHeight: 1.8,
            color: l.muted ? theme.faint : theme.dim,
          }}
        >
          <span style={{ color }}>{l.icon}</span> {l.text}
        </div>
      ))}
    </div>
  );
};

/**
 * The product statusline, matching `gremlord statusline`:
 *   main · auto→opus (deep) · sess $0.84 · day $4.31/$25 [██░░░░]
 * The budget bar attaches directly to the day figure with no separator, the
 * same invariant the CLI enforces.
 */
export const StatusLine: React.FC<{
  profile?: string;
  model: string;
  modelColor: string;
  sess: number;
  day: number;
  cap: number;
  /** Extra trailing segments, e.g. a goal badge or a context readout. */
  extra?: React.ReactNode;
  emphasis?: number;
}> = ({
  profile = 'main',
  model,
  modelColor,
  sess,
  day,
  cap,
  extra,
  emphasis = 0,
}) => {
  const cells = 6;
  const frac = cap > 0 ? day / cap : 0;
  const filled = Math.max(1, Math.min(cells, Math.round(frac * cells)));
  const bar = '█'.repeat(filled) + '░'.repeat(cells - filled);
  // The CLI turns the bar amber at 80% of the cap and red at 100%; both states
  // also change the printed numbers, so colour is never the only signal.
  const barColor =
    frac >= 1 ? theme.red : frac >= 0.8 ? theme.amber : theme.accent;

  return (
    <div
      style={{
        borderTop: `1px solid ${theme.panelBorder}`,
        backgroundColor: '#0c0c0f',
        padding: '13px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        fontSize: 17,
        color: theme.dim,
      }}
    >
      <span style={{ color: theme.text }}>{profile}</span>
      <Sep />
      <span style={{ color: modelColor, minWidth: 52 }}>{model}</span>
      <Sep />
      <span>
        sess <span style={{ color: theme.text }}>${sess.toFixed(3)}</span>
      </span>
      <Sep />
      <span>
        day <span style={{ color: theme.text }}>${day.toFixed(3)}</span>
        <span style={{ color: theme.faint }}> / ${cap.toFixed(2)}</span>
      </span>
      {extra}
      <span
        style={{
          marginLeft: 'auto',
          fontSize: 16,
          letterSpacing: 1,
          color: barColor,
          textShadow: `0 0 ${8 * emphasis}px ${barColor}`,
        }}
      >
        [{bar}]
      </span>
    </div>
  );
};

/** Braille spinner that resolves to a check. Frame-driven, no CSS animation. */
export const Spinner: React.FC<{
  /** Spinner runs while frame < doneAt, then shows `doneGlyph`. */
  doneAt: number;
  color?: string;
  doneGlyph?: string;
  doneColor?: string;
}> = ({ doneAt, color = theme.accentSoft, doneGlyph = '✓', doneColor }) => {
  const frame = useCurrentFrame();
  const glyphs = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧'];
  if (frame >= doneAt) {
    return (
      <span style={{ color: doneColor ?? theme.green, width: 14, display: 'inline-block' }}>
        {doneGlyph}
      </span>
    );
  }
  return (
    <span style={{ color, width: 14, display: 'inline-block' }}>
      {glyphs[Math.floor(frame / 2) % glyphs.length]}
    </span>
  );
};
