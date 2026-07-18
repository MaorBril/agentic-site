import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
  Sequence,
} from 'remotion';
import { theme } from '../theme';
import { Typewriter } from '../anim';

/**
 * The "wow" demo: `auto` routes a mechanical task to a cheap local model and a
 * planning task to Opus, while the live spend statusline ticks up by fractions
 * of a cent. The statusline is the hero element.
 *
 * Timeline (30fps):
 *   0–20    window in, empty prompt, day $2.10 / $25
 *   20–70   type mechanical prompt
 *   70–100  classifier chip: auto → light → qwen
 *   100–150 qwen edits stream, sess + day tick a hair
 *   150–210 type planning prompt
 *   210–240 classifier chip: auto → deep → opus
 *   240–330 opus plan streams, day climbs to 2.16
 *   330–380 statusline emphasis
 */

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

const DAY_START = 2.1;
const DAY_AFTER_QWEN = 2.104;
const DAY_AFTER_OPUS = 2.163;
const CAP = 25;

export const DEMO_DURATION = 400;

export const SceneDemo: React.FC = () => {
  const frame = useCurrentFrame();

  const windowO = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOut,
  });

  // Which model the statusline currently shows.
  const model = frame < 100 ? 'auto' : frame < 240 ? 'qwen' : 'opus';

  // Session + day spend climb in two steps as each turn resolves.
  const sess =
    frame < 100
      ? 0
      : frame < 240
      ? interpolate(frame, [100, 130], [0, 0.004], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : interpolate(frame, [240, 300], [0.004, 0.063], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

  const day =
    frame < 100
      ? DAY_START
      : frame < 240
      ? interpolate(frame, [100, 130], [DAY_START, DAY_AFTER_QWEN], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : interpolate(frame, [240, 300], [DAY_AFTER_QWEN, DAY_AFTER_OPUS], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: theme.mono,
      }}
    >
      <div
        style={{
          width: 1080,
          height: 600,
          opacity: windowO,
          scale: interpolate(windowO, [0, 1], [0.97, 1]),
          borderRadius: 14,
          overflow: 'hidden',
          border: `1px solid ${theme.panelBorder}`,
          backgroundColor: theme.panel,
          boxShadow: '0 40px 120px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* title bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '14px 18px',
            borderBottom: `1px solid ${theme.panelBorder}`,
            backgroundColor: '#0e0e11',
          }}
        >
          <Dot color="#ff5f57" />
          <Dot color="#febc2e" />
          <Dot color="#28c840" />
          <span style={{ marginLeft: 12, color: theme.dim, fontSize: 15 }}>
            claude — agentic · model auto
          </span>
        </div>

        {/* conversation body */}
        <div
          style={{
            flex: 1,
            padding: '24px 30px',
            fontSize: 19,
            lineHeight: 1.7,
            position: 'relative',
          }}
        >
          {/* Turn 1 — mechanical task → qwen */}
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ color: theme.accent }}>❯</span>
            <Typewriter
              text="rename getUser → fetchUser across the repo"
              startFrame={22}
              duration={40}
              hideCaretAfter={70}
            />
          </div>

          <Sequence from={70} durationInFrames={330} layout="none">
            <ClassifierChip
              tier="light"
              model="qwen"
              color={theme.green}
              note="mechanical edit"
            />
          </Sequence>

          <Sequence from={104} durationInFrames={296} layout="none">
            <ResultLines
              lines={[
                { icon: '✓', text: 'edited 3 files · 12 call-sites' },
                { icon: '✓', text: 'ran tests · 41 passed', muted: true },
              ]}
              color={theme.green}
            />
          </Sequence>

          {/* Turn 2 — planning task → opus.
              Inside a Sequence, so Typewriter frames are LOCAL to from={150}. */}
          <Sequence from={150} durationInFrames={250} layout="none">
            <div style={{ marginTop: 18, display: 'flex', gap: 12 }}>
              <span style={{ color: theme.accent }}>❯</span>
              <Typewriter
                text="plan the auth-service migration"
                startFrame={8}
                duration={34}
                hideCaretAfter={60}
              />
            </div>
          </Sequence>

          <Sequence from={210} durationInFrames={190} layout="none">
            <ClassifierChip
              tier="deep"
              model="opus"
              color={theme.accentSoft}
              note="architectural planning"
            />
          </Sequence>

          <Sequence from={246} durationInFrames={154} layout="none">
            <ResultLines
              lines={[
                { icon: '›', text: 'drafting migration plan · 5 steps' },
                { icon: '›', text: 'mapping schema + rollback', muted: true },
              ]}
              color={theme.accentSoft}
            />
          </Sequence>
        </div>

        {/* statusline — the hero */}
        <StatusLine model={model} sess={sess} day={day} cap={CAP} frame={frame} />
      </div>

      {/* one-line caption under the window */}
      <div
        style={{
          marginTop: 26,
          fontFamily: theme.sans,
          fontSize: 21,
          color: theme.dim,
          opacity: interpolate(frame, [40, 60], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        A <span style={{ color: theme.text }}>$0.0005</span> classifier picks the
        model. You never think about it.
      </div>
    </AbsoluteFill>
  );
};

const ClassifierChip: React.FC<{
  tier: string;
  model: string;
  color: string;
  note: string;
}> = ({ tier, model, color, note }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOut,
  });
  const y = interpolate(frame, [0, 10], [6, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOut,
  });
  // model name resolves ~8 frames after the chip appears
  const resolved = frame >= 12;

  return (
    <div
      style={{
        marginTop: 10,
        opacity: o,
        translate: `0px ${y}px`,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 15,
      }}
    >
      <span
        style={{
          color,
          border: `1px solid ${color}55`,
          backgroundColor: `${color}14`,
          borderRadius: 6,
          padding: '3px 9px',
          textTransform: 'uppercase',
          letterSpacing: 1,
          fontSize: 12,
        }}
      >
        auto → {tier}
      </span>
      <span style={{ color: theme.faint }}>→</span>
      <span style={{ color: resolved ? color : theme.faint }}>
        {resolved ? model : 'classifying…'}
      </span>
      <span style={{ color: theme.faint, fontSize: 14 }}>· {note}</span>
    </div>
  );
};

const ResultLines: React.FC<{
  lines: { icon: string; text: string; muted?: boolean }[];
  color: string;
}> = ({ lines, color }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ marginTop: 8 }}>
      {lines.map((l, i) => {
        const at = i * 12;
        const o = interpolate(frame, [at, at + 10], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <div
            key={i}
            style={{
              opacity: o,
              fontSize: 17,
              lineHeight: 1.8,
              color: l.muted ? theme.faint : theme.dim,
            }}
          >
            <span style={{ color }}>{l.icon}</span> {l.text}
          </div>
        );
      })}
    </div>
  );
};

const StatusLine: React.FC<{
  model: string;
  sess: number;
  day: number;
  cap: number;
  frame: number;
}> = ({ model, sess, day, cap, frame }) => {
  const pct = day / cap;
  const cells = 8;
  const filled = Math.max(1, Math.round(pct * cells));
  const bar = '█'.repeat(filled) + '░'.repeat(cells - filled);

  // subtle emphasis pulse near the end
  const emph = interpolate(frame, [330, 350, 380], [0, 1, 0.4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const modelColor =
    model === 'opus'
      ? theme.accentSoft
      : model === 'qwen'
      ? theme.green
      : theme.cyan;

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
      <span style={{ color: theme.text }}>main</span>
      <Sep />
      <span style={{ color: modelColor, minWidth: 52 }}>{model}</span>
      <Sep />
      <span>
        sess <span style={{ color: theme.text }}>${sess.toFixed(3)}</span>
      </span>
      <Sep />
      <span>
        day{' '}
        <span style={{ color: theme.text }}>${day.toFixed(3)}</span>
        <span style={{ color: theme.faint }}> / ${cap.toFixed(2)}</span>
      </span>
      <span
        style={{
          marginLeft: 'auto',
          fontSize: 16,
          letterSpacing: 1,
          color: theme.accent,
          textShadow: `0 0 ${8 * emph}px ${theme.accent}`,
        }}
      >
        [{bar}]
      </span>
    </div>
  );
};

const Sep: React.FC = () => (
  <span style={{ color: theme.faint }}>·</span>
);

const Dot: React.FC<{ color: string }> = ({ color }) => (
  <span
    style={{
      width: 13,
      height: 13,
      borderRadius: '50%',
      backgroundColor: color,
      display: 'inline-block',
    }}
  />
);
