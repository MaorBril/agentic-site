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
 * The "wow" demo: `auto` routes a mechanical task to a cheap local model, a
 * planning task to Opus, and a monitoring-style task trips a second, amber
 * "Auto Goal" classifier that arms a recurring check-in instead of just
 * replying once. The live spend statusline ticks up by fractions of a cent
 * throughout — it's the hero element, alongside the new goal badge.
 *
 * Timeline (30fps):
 *   0–20    window in, empty prompt, day $2.100 / $25
 *   20–70   type mechanical prompt
 *   70–104  classifier chip: auto → light → qwen
 *   104–150 qwen edits stream, sess + day tick a hair
 *   150–210 type planning prompt
 *   210–246 classifier chip: auto → deep → opus
 *   246–340 opus plan streams, day climbs to 2.163
 *   340–400 type monitoring prompt
 *   400–434 tier classifier chip: auto → standard → sonnet
 *   434–468 goal classifier chip: auto → goal → ScheduleWakeup (amber)
 *   468–600 goal armed, statusline gains "⟳ goal" badge, day → 2.169
 */

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

const DAY_START = 2.1;
const DAY_AFTER_QWEN = 2.104;
const DAY_AFTER_OPUS = 2.163;
const DAY_AFTER_GOAL = 2.169;
const CAP = 25;

const GOAL_REASON = 'flaky e2e suite';
const GOAL_RESOLVED_AT = 446; // goal chip's own local frame-12 reveal, absolute

export const DEMO_DURATION = 600;

export const SceneDemo: React.FC = () => {
  const frame = useCurrentFrame();

  const windowO = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOut,
  });

  // Which model the statusline currently shows.
  const model =
    frame < 100 ? 'auto' : frame < 240 ? 'qwen' : frame < 468 ? 'opus' : 'sonnet';

  // Session + day spend climb in three steps as each turn resolves.
  const sess =
    frame < 100
      ? 0
      : frame < 240
      ? interpolate(frame, [100, 130], [0, 0.004], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : frame < 468
      ? interpolate(frame, [240, 300], [0.004, 0.063], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : interpolate(frame, [468, 500], [0.063, 0.069], {
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
      : frame < 468
      ? interpolate(frame, [240, 300], [DAY_AFTER_QWEN, DAY_AFTER_OPUS], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : interpolate(frame, [468, 500], [DAY_AFTER_OPUS, DAY_AFTER_GOAL], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

  const goalReason = frame >= GOAL_RESOLVED_AT ? GOAL_REASON : undefined;

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

          <Sequence from={70} durationInFrames={530} layout="none">
            <ClassifierChip
              tier="light"
              model="qwen"
              color={theme.green}
              note="mechanical edit"
            />
          </Sequence>

          <Sequence from={104} durationInFrames={496} layout="none">
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
          <Sequence from={150} durationInFrames={450} layout="none">
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

          <Sequence from={210} durationInFrames={390} layout="none">
            <ClassifierChip
              tier="deep"
              model="opus"
              color={theme.accentSoft}
              note="architectural planning"
            />
          </Sequence>

          <Sequence from={246} durationInFrames={354} layout="none">
            <ResultLines
              lines={[
                { icon: '›', text: 'drafting migration plan · 5 steps' },
                { icon: '›', text: 'mapping schema + rollback', muted: true },
              ]}
              color={theme.accentSoft}
            />
          </Sequence>

          {/* Turn 3 — monitoring task → tier classifier picks sonnet, AND a
              second, independent classifier flags it as loop-worthy (Auto
              Goal), nudging Claude Code toward ScheduleWakeup / `/loop`
              instead of a single reply. */}
          <Sequence from={340} durationInFrames={260} layout="none">
            <div style={{ marginTop: 18, display: 'flex', gap: 12 }}>
              <span style={{ color: theme.accent }}>❯</span>
              <Typewriter
                text="retry the flaky e2e suite until it's green"
                startFrame={8}
                duration={38}
                hideCaretAfter={60}
              />
            </div>
          </Sequence>

          <Sequence from={400} durationInFrames={200} layout="none">
            <ClassifierChip
              tier="standard"
              model="sonnet"
              color={theme.cyan}
              note="test monitoring"
            />
          </Sequence>

          <Sequence from={434} durationInFrames={166} layout="none">
            <ClassifierChip
              tier="goal"
              model="ScheduleWakeup"
              color={theme.amber}
              note="flaky suite needs retries"
            />
          </Sequence>

          <Sequence from={468} durationInFrames={132} layout="none">
            <ResultLines
              lines={[
                {
                  icon: '⟳',
                  text: 'goal loop armed · rechecks every 5m until green',
                },
              ]}
              color={theme.amber}
            />
          </Sequence>
        </div>

        {/* statusline — the hero */}
        <StatusLine
          model={model}
          sess={sess}
          day={day}
          cap={CAP}
          frame={frame}
          goalReason={goalReason}
        />
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
        Two cheap classifiers watch every turn —{' '}
        <span style={{ color: theme.text }}>one picks the model</span>, the
        other decides if it needs a loop.
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
  goalReason?: string;
}> = ({ model, sess, day, cap, frame, goalReason }) => {
  const pct = day / cap;
  const cells = 8;
  const filled = Math.max(1, Math.round(pct * cells));
  const bar = '█'.repeat(filled) + '░'.repeat(cells - filled);

  // subtle emphasis pulse near the end
  const emph = interpolate(frame, [530, 550, 580], [0, 1, 0.4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const modelColor =
    model === 'opus'
      ? theme.accentSoft
      : model === 'qwen'
      ? theme.green
      : theme.cyan;

  // Goal badge fades/slides in the same way the classifier chips do.
  const goalFrame = frame - GOAL_RESOLVED_AT;
  const goalO = interpolate(goalFrame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOut,
  });

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
      {goalReason && (
        <span style={{ opacity: goalO, display: 'flex', alignItems: 'center', gap: 14 }}>
          <Sep />
          <span style={{ color: theme.amber }}>
            ⟳ goal <span style={{ color: theme.faint }}>({goalReason})</span>
          </span>
        </span>
      )}
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
