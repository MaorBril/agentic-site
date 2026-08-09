import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { theme } from '../theme';
import { easeOut } from './TerminalPanel';

/**
 * Generic horizontal progress track plus labelled event markers.
 *
 * This is a quantitative chart, not decoration, so the rules are strict:
 *  - Every track that appears together shares ONE `domainMax`. Two series are
 *    only ever drawn against the same scale; there is no second axis.
 *  - The value is always printed as text next to the bar, so the bar length is
 *    a redundant encoding rather than the only one.
 *  - Markers carry a visible label and a solid rule, so a compaction event
 *    survives grayscale and forced-colors.
 */
export const Track: React.FC<{
  label: string;
  /** Printed to the right of the bar, e.g. "48K / 55K". */
  readout: string;
  /** Current value in domain units. */
  value: number;
  /** Shared scale maximum. Identical for every track in a group. */
  domainMax: number;
  color: string;
  /** Bar fill grows from 0 to `value` across these frames. */
  growFrom?: number;
  growTo?: number;
  /** Vertical event markers, in domain units. */
  markers?: TrackMarker[];
  /** Hatched region beyond a model's usable window. */
  overflowFrom?: number;
  height?: number;
  labelWidth?: number;
  readoutWidth?: number;
}> = ({
  label,
  readout,
  value,
  domainMax,
  color,
  growFrom = 0,
  growTo = 20,
  markers = [],
  overflowFrom,
  height = 16,
  labelWidth = 190,
  readoutWidth = 132,
}) => {
  const frame = useCurrentFrame();
  const grow = interpolate(frame, [growFrom, growTo], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOut,
  });
  const pct = domainMax > 0 ? (value / domainMax) * 100 * grow : 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        fontSize: 16,
        lineHeight: 2,
      }}
    >
      <span style={{ color: theme.dim, minWidth: labelWidth }}>{label}</span>
      <div
        style={{
          flex: 1,
          height,
          borderRadius: 4,
          backgroundColor: '#1b1b20',
          position: 'relative',
          border: `1px solid ${theme.panelBorder}`,
        }}
      >
        {/* Region past this model's usable window, drawn as hatching so it
            reads as "out of bounds" without relying on hue. */}
        {overflowFrom != null && domainMax > 0 && (
          <div
            style={{
              position: 'absolute',
              left: `${(overflowFrom / domainMax) * 100}%`,
              top: 0,
              bottom: 0,
              right: 0,
              backgroundImage:
                'repeating-linear-gradient(135deg, #2a2a31 0 3px, transparent 3px 7px)',
            }}
          />
        )}
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 3,
          }}
        />
        {markers.map((m) => (
          <Marker key={m.label} {...m} domainMax={domainMax} />
        ))}
      </div>
      <span
        style={{
          color: theme.text,
          minWidth: readoutWidth,
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {readout}
      </span>
    </div>
  );
};

export type TrackMarker = {
  /** Position in domain units. */
  at: number;
  label: string;
  color?: string;
  /** Marker fades in over these frames. */
  showFrom?: number;
  /** Draw the label under the track instead of above it. */
  below?: boolean;
};

const Marker: React.FC<TrackMarker & { domainMax: number }> = ({
  at,
  label,
  color = theme.amber,
  showFrom = 0,
  below,
  domainMax,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [showFrom, showFrom + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: `${(at / domainMax) * 100}%`,
        top: -6,
        bottom: -6,
        width: 2,
        backgroundColor: color,
        opacity: o,
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: 6,
          [below ? 'top' : 'bottom']: 20,
          color,
          fontSize: 13,
          letterSpacing: 0.5,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </div>
  );
};

/** Axis rule with tick labels, printed once beneath a group of tracks. */
export const TrackAxis: React.FC<{
  ticks: { at: number; label: string }[];
  domainMax: number;
  labelWidth?: number;
  readoutWidth?: number;
  caption?: string;
}> = ({ ticks, domainMax, labelWidth = 190, readoutWidth = 132, caption }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
      fontSize: 13,
      marginTop: 2,
    }}
  >
    <span style={{ minWidth: labelWidth, color: theme.faint }}>{caption}</span>
    <div style={{ flex: 1, position: 'relative', height: 18 }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 1,
          backgroundColor: theme.panelBorder,
        }}
      />
      {ticks.map((t) => (
        <span
          key={t.label}
          style={{
            position: 'absolute',
            left: `${(t.at / domainMax) * 100}%`,
            top: 3,
            color: theme.faint,
            translate: '-50% 0',
            whiteSpace: 'nowrap',
          }}
        >
          {t.label}
        </span>
      ))}
    </div>
    <span style={{ minWidth: readoutWidth }} />
  </div>
);

/**
 * Legend for the two-series view. Each entry pairs its swatch with a shape
 * glyph and the series name, so the pairing is not carried by colour alone.
 */
export const Legend: React.FC<{
  items: { color: string; glyph: string; label: string }[];
  at?: number;
}> = ({ items, at = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        display: 'flex',
        gap: 22,
        fontSize: 14,
        color: theme.dim,
        opacity: interpolate(frame, [at, at + 12], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
      }}
    >
      {items.map((it) => (
        <span
          key={it.label}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <span
            style={{
              width: 14,
              height: 10,
              borderRadius: 2,
              backgroundColor: it.color,
              display: 'inline-block',
            }}
          />
          <span style={{ color: it.color }}>{it.glyph}</span>
          {it.label}
        </span>
      ))}
    </div>
  );
};
