import React from 'react';
import { interpolate, Sequence, useCurrentFrame } from 'remotion';
import { theme } from '../theme';
import { Typewriter } from '../anim';
import { PromptLine, Sep, TerminalPanel, easeOut } from '../components/TerminalPanel';
import { DecisionChip, ResultLines, StatusLine, Tag } from '../components/Chrome';
import { Legend, Track, TrackAxis } from '../components/Track';

/**
 * HeroContext — "context that fits the model".
 *
 * The story, in one shot: a long session outgrows a small model's window, the
 * router advances to the smallest model that still fits instead of failing,
 * and virtual context scaling makes Claude Code's own context gauge agree with
 * what the model actually holds — so compaction fires at the real limit.
 *
 * Numbers are the measured case from the context-scaling docs: a 128K-window
 * model with a 55K effective budget, holding 48K true tokens, reported to the
 * client as 175K of its assumed 200K window. Both readings are 87% full, which
 * is the entire point.
 *
 * Timeline (30fps, 600 frames = 20s):
 *    0– 90  window in, session prompt types, statusline idles
 *   90–215  route candidates in fixed order with explicit eligibility
 *  215–370  two tracks on ONE 0–100% fullness scale; reported converges on
 *           actual as scaling engages; compaction threshold marked
 *  370–460  route settles on the smallest fitting model, then the
 *           prompt-too-long guard as a brief counterexample
 *  460–600  `agentic context <session-id>` output with the compaction marker
 */

export const HERO_CONTEXT_DURATION = 600;
/**
 * Frame used for the poster image: dual-track view, fully converged.
 * Mirrored in `posters.mjs`, which is what the render scripts actually read.
 */
export const HERO_CONTEXT_POSTER = 330;

// ---------------------------------------------------------------------------
// Scenario constants. Everything downstream derives from these so the frames
// can never disagree with each other.
// ---------------------------------------------------------------------------
const ASSUMED_WINDOW = 200; // K — what Claude Code assumes it is talking to
const BUDGET = 55; // K — selected model's effective context budget
const WINDOW = 128; // K — selected model's real context window
const TRUE_HELD = 48; // K — tokens the model actually holds at turn 34
const SCALE = ASSUMED_WINDOW / BUDGET; // 3.64x
const REPORTED = Math.round(TRUE_HELD * SCALE); // 175K
const ACTUAL_PCT = (TRUE_HELD / BUDGET) * 100; // 87.3%
const REPORTED_PCT = (REPORTED / ASSUMED_WINDOW) * 100; // 87.5%
const UNSCALED_PCT = (TRUE_HELD / ASSUMED_WINDOW) * 100; // 24% — the old bug
const COMPACT_AT_PCT = 92; // client's compaction warning threshold

const EST_INPUT = 41231; // estimated input tokens for this turn
const RESERVED_OUTPUT = 8192; // default reserved output
const REQUIRED_K = Math.round((EST_INPUT + RESERVED_OUTPUT) / 1000); // 49K

const SELECTED = 'glm-4.6';
const SMALL_MODEL = 'qwen3-coder-30b';
const SESSION = '5f2c1a9e';

const PHASE_B = 215;
const PHASE_C = 370;
const PHASE_D = 460;

export const HeroContext: React.FC = () => {
  const frame = useCurrentFrame();

  // Statusline: alias resolves to the selected model once routing lands.
  const routed = frame >= 150;
  const model = routed ? `auto→${SELECTED}` : 'auto';
  const modelColor = routed ? theme.cyan : theme.dim;

  const sess = interpolate(frame, [150, 260], [0.118, 0.314], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const day = interpolate(frame, [150, 260], [1.944, 2.14], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <TerminalPanel
      title={`claude — agentic · session ${SESSION} · model auto`}
      caption={<HeroCaption />}
      captionAt={60}
      footer={
        <StatusLine
          model={model}
          modelColor={modelColor}
          sess={sess}
          day={day}
          cap={25}
          emphasis={interpolate(frame, [560, 580], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })}
          extra={
            frame >= 300 ? (
              <span
                style={{
                  opacity: interpolate(frame, [300, 314], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  }),
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <Sep />
                <span>
                  ctx{' '}
                  <span style={{ color: theme.text }}>
                    {TRUE_HELD}K/{BUDGET}K
                  </span>
                  <span style={{ color: theme.faint }}> ({Math.round(ACTUAL_PCT)}%)</span>
                </span>
              </span>
            ) : undefined
          }
        />
      }
    >
      {/* The session prompt stays pinned at the top of the body all the way
          through, so every later phase reads as "this turn". */}
      <PromptLine>
        <Typewriter
          text="finish the payments refactor"
          startFrame={10}
          duration={38}
          hideCaretAfter={58}
        />
      </PromptLine>

      <Sequence name="Session size" from={62} layout="none">
        <SessionMeta />
      </Sequence>

      <Sequence
        name="Phase A · candidate eligibility"
        from={90}
        durationInFrames={PHASE_B - 90 + 14}
        layout="none"
      >
        <PhaseCandidates />
      </Sequence>

      <Sequence
        name="Phase B · actual vs reported context"
        from={PHASE_B}
        durationInFrames={PHASE_C - PHASE_B + 14}
        layout="none"
      >
        <PhaseTracks />
      </Sequence>

      <Sequence
        name="Phase C · route settles, guard counterexample"
        from={PHASE_C}
        durationInFrames={PHASE_D - PHASE_C + 14}
        layout="none"
      >
        <PhaseGuard />
      </Sequence>

      <Sequence
        name="Phase D · agentic context output"
        from={PHASE_D}
        durationInFrames={HERO_CONTEXT_DURATION - PHASE_D}
        layout="none"
      >
        <PhaseContextCmd />
      </Sequence>
    </TerminalPanel>
  );
};

/** Fades a phase in, and out again over its final 14 frames. */
const Phase: React.FC<{
  dur: number;
  children: React.ReactNode;
  marginTop?: number;
}> = ({ dur, children, marginTop = 20 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        marginTop,
        opacity: interpolate(
          frame,
          [0, 12, dur - 14, dur],
          [0, 1, 1, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut }
        ),
      }}
    >
      {children}
    </div>
  );
};

const SessionMeta: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        marginTop: 6,
        fontSize: 15,
        color: theme.faint,
        opacity: interpolate(frame, [0, 12], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
      }}
    >
      turn 34 · {TRUE_HELD}K tokens held · this request needs ~{REQUIRED_K}K (
      {(EST_INPUT / 1000).toFixed(0)}K input + {RESERVED_OUTPUT / 1024}K reserved
      output)
    </div>
  );
};

// ---------------------------------------------------------------------------
// Phase A — candidate eligibility by request size.
// ---------------------------------------------------------------------------

type Candidate = {
  tier: string;
  model: string;
  budget: number; // K
  window: number; // K
  eligible: boolean;
  verdict: string;
  selected?: boolean;
};

const CANDIDATES: Candidate[] = [
  {
    tier: 'light',
    model: SMALL_MODEL,
    budget: 32,
    window: 32,
    eligible: false,
    verdict: 'too small',
  },
  {
    tier: 'standard',
    model: SELECTED,
    budget: BUDGET,
    window: WINDOW,
    eligible: true,
    verdict: 'fits',
    selected: true,
  },
  {
    tier: 'deep',
    model: 'opus',
    budget: 200,
    window: 200,
    eligible: true,
    verdict: 'fits',
  },
];

const PhaseCandidates: React.FC = () => (
  <Phase dur={PHASE_B - 90 + 14}>
    <div style={{ fontSize: 14, color: theme.faint, marginBottom: 10 }}>
      route candidates · eligibility by request size
    </div>
    {CANDIDATES.map((c, i) => (
      <Sequence
        key={c.model}
        name={`Candidate ${c.tier}`}
        from={8 + i * 20}
        layout="none"
      >
        <CandidateRow candidate={c} revealVerdictAt={12} />
      </Sequence>
    ))}
    <Sequence name="Size remap" from={78} layout="none">
      <DecisionChip
        tag="size remap"
        value={`light → standard`}
        note={`~${REQUIRED_K}K exceeds 32K · advancing to the smallest model that fits`}
        color={theme.cyan}
        resolveAt={10}
        marginTop={16}
      />
    </Sequence>
  </Phase>
);

const CandidateRow: React.FC<{
  candidate: Candidate;
  revealVerdictAt: number;
}> = ({ candidate, revealVerdictAt }) => {
  const frame = useCurrentFrame();
  const revealed = frame >= revealVerdictAt;
  // Ineligible candidates are dimmed AND struck through AND icon-marked.
  const icon = candidate.eligible ? '✓' : '✗';
  const iconColor = candidate.eligible ? theme.green : theme.red;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        fontSize: 17,
        lineHeight: 2,
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
      }}
    >
      <span style={{ minWidth: 96 }}>
        <Tag color={candidate.selected ? theme.cyan : theme.faint}>
          {candidate.tier}
        </Tag>
      </span>
      <span
        style={{
          color: candidate.eligible ? theme.text : theme.faint,
          minWidth: 230,
          textDecoration: revealed && !candidate.eligible ? 'line-through' : 'none',
        }}
      >
        {candidate.model}
      </span>
      <span style={{ color: theme.dim, minWidth: 190 }}>
        {candidate.budget}K usable
        {candidate.window !== candidate.budget && (
          <span style={{ color: theme.faint }}> of {candidate.window}K</span>
        )}
      </span>
      <span style={{ minWidth: 150, color: revealed ? theme.dim : theme.faint }}>
        {revealed ? (
          <>
            <span style={{ color: iconColor }}>{icon}</span> {candidate.verdict}
          </>
        ) : (
          'checking…'
        )}
      </span>
      {revealed && candidate.selected && (
        <span style={{ color: theme.cyan, fontSize: 14 }}>← selected</span>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Phase B — actual vs reported context, on ONE shared scale.
//
// The shared domain is fullness, 0–100%. Token counts ride along as text
// readouts. This is the only honest way to put "48K of a 55K budget" and
// "175K of a 200K assumed window" on the same axis: the whole claim is that
// virtual scaling makes those two fractions equal.
// ---------------------------------------------------------------------------

const PhaseTracks: React.FC = () => {
  const frame = useCurrentFrame();

  // Reported fullness starts where it would sit WITHOUT scaling (24% — the
  // client thinks the session is nearly empty) and converges onto the actual
  // fullness as scaling engages.
  const scaling = interpolate(frame, [64, 104], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOut,
  });
  const reportedPct = interpolate(scaling, [0, 1], [UNSCALED_PCT, REPORTED_PCT]);
  const reportedK = Math.round(
    interpolate(scaling, [0, 1], [TRUE_HELD, REPORTED])
  );

  return (
    <Phase dur={PHASE_C - PHASE_B + 14} marginTop={18}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 12,
        }}
      >
        <span style={{ fontSize: 14, color: theme.faint }}>
          context fullness · one shared scale, 0–100% of each window
        </span>
        <Legend
          at={4}
          items={[
            { color: theme.cyan, glyph: '●', label: 'actual (model)' },
            { color: theme.accentSoft, glyph: '◆', label: 'reported (Claude Code)' },
          ]}
        />
      </div>

      <Track
        label="● actual · model holds"
        readout={`${TRUE_HELD}K / ${BUDGET}K`}
        value={ACTUAL_PCT}
        domainMax={100}
        color={theme.cyan}
        growFrom={10}
        growTo={44}
        overflowFrom={COMPACT_AT_PCT}
        markers={[
          {
            at: COMPACT_AT_PCT,
            label: `compacts at ${Math.round((COMPACT_AT_PCT / 100) * BUDGET)}K`,
            color: theme.amber,
            showFrom: 30,
          },
        ]}
      />

      <div style={{ height: 44 }} />

      <Track
        label="◆ reported · client sees"
        readout={`${reportedK}K / ${ASSUMED_WINDOW}K`}
        value={reportedPct}
        domainMax={100}
        color={theme.accentSoft}
        growFrom={10}
        growTo={44}
        overflowFrom={COMPACT_AT_PCT}
        markers={[
          {
            at: COMPACT_AT_PCT,
            label: `compacts at ${Math.round((COMPACT_AT_PCT / 100) * ASSUMED_WINDOW)}K`,
            color: theme.amber,
            showFrom: 30,
          },
        ]}
      />

      <div style={{ height: 10 }} />

      <TrackAxis
        domainMax={100}
        caption="% of window"
        ticks={[
          { at: 0, label: '0' },
          { at: 25, label: '25' },
          { at: 50, label: '50' },
          { at: 75, label: '75' },
          { at: 100, label: '100' },
        ]}
      />

      <Sequence name="Scaling explainer" from={58} layout="none">
        <ScalingNote />
      </Sequence>
    </Phase>
  );
};

const ScalingNote: React.FC = () => {
  const frame = useCurrentFrame();
  const settled = frame >= 46;
  return (
    <div
      style={{
        marginTop: 16,
        opacity: interpolate(frame, [0, 12], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
        fontSize: 15,
        color: theme.dim,
        borderLeft: `2px solid ${theme.accent}`,
        paddingLeft: 14,
        lineHeight: 1.7,
      }}
    >
      virtual context scaling · ×{SCALE.toFixed(2)} ({ASSUMED_WINDOW}K ÷ {BUDGET}K)
      <br />
      <span style={{ color: settled ? theme.text : theme.faint }}>
        {settled
          ? `both readings agree at ${Math.round(ACTUAL_PCT)}% — the client compacts at the model's real limit`
          : `unscaled, the client would read ${Math.round(UNSCALED_PCT)}% full and overflow the model`}
      </span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Phase C — the route settles, then the guard as a counterexample.
// ---------------------------------------------------------------------------

const PhaseGuard: React.FC = () => (
  <Phase dur={PHASE_D - PHASE_C + 14} marginTop={18}>
    <Sequence name="Route settled" from={0} layout="none">
      <ResultLines
        marginTop={0}
        color={theme.green}
        lines={[
          {
            icon: '✓',
            text: `routed to ${SELECTED} · smallest candidate that fits · size:light→standard`,
          },
        ]}
      />
    </Sequence>

    <Sequence name="Guard counterexample" from={26} layout="none">
      <GuardBlock />
    </Sequence>
  </Phase>
);

const GuardBlock: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        marginTop: 22,
        opacity: interpolate(frame, [0, 12], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: easeOut,
        }),
      }}
    >
      <div style={{ fontSize: 14, color: theme.faint, marginBottom: 10 }}>
        and when nothing fits — it fails loudly instead of silently truncating
      </div>
      <div
        style={{
          border: `1px solid ${theme.red}44`,
          backgroundColor: `${theme.red}0e`,
          borderRadius: 8,
          padding: '14px 16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 8,
          }}
        >
          <Tag color={theme.red}>guard</Tag>
          <span style={{ color: theme.red, fontSize: 15 }}>
            ✗ 400 invalid_request_error · prompt_too_long
          </span>
        </div>
        <div
          style={{
            fontSize: 14,
            color: theme.dim,
            lineHeight: 1.7,
          }}
        >
          agentic: request too large for model{' '}
          <span style={{ color: theme.text }}>&quot;{SMALL_MODEL}&quot;</span>{' '}
          context budget (estimated {EST_INPUT.toLocaleString('en-US')} + reserved
          output exceeds budget {(32768).toLocaleString('en-US')}); reduce the
          conversation or switch models
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Phase D — `agentic context <session-id>`.
// ---------------------------------------------------------------------------

type CtxRow = {
  time: string;
  trueK: number;
  compacted?: boolean;
};

const CTX_ROWS: CtxRow[] = [
  { time: '14:02', trueK: 18 },
  { time: '14:19', trueK: TRUE_HELD },
  { time: '14:23', trueK: 9, compacted: true },
];

const PhaseContextCmd: React.FC = () => (
  <Phase dur={HERO_CONTEXT_DURATION - PHASE_D} marginTop={18}>
    <PromptLine>
      <Typewriter
        text={`agentic context ${SESSION}`}
        startFrame={2}
        duration={26}
        hideCaretAfter={34}
      />
    </PromptLine>

    <Sequence name="Context table" from={38} layout="none">
      <ContextTable />
    </Sequence>
  </Phase>
);

const ContextTable: React.FC = () => {
  const frame = useCurrentFrame();
  const cols = '86px 150px 78px 96px 100px 1fr';

  return (
    <div
      style={{
        marginTop: 16,
        fontSize: 15,
        opacity: interpolate(frame, [0, 10], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
      }}
    >
      <div style={{ color: theme.dim, marginBottom: 10 }}>
        Session {SESSION} — 34 requests
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: cols,
          gap: 10,
          color: theme.faint,
          fontSize: 13,
          letterSpacing: 0.4,
          paddingBottom: 6,
          borderBottom: `1px solid ${theme.panelBorder}`,
        }}
      >
        <span>time</span>
        <span>model</span>
        <span style={{ textAlign: 'right' }}>true</span>
        <span style={{ textAlign: 'right' }}>reported</span>
        <span style={{ textAlign: 'right' }}>budget</span>
        <span>fullness</span>
      </div>

      {CTX_ROWS.map((r, i) => (
        <Sequence key={r.time} name={`Request ${r.time}`} from={10 + i * 14} layout="none">
          <ContextRow row={r} cols={cols} />
        </Sequence>
      ))}

      <Sequence name="Assumed window footer" from={62} layout="none">
        <ContextFooter />
      </Sequence>
    </div>
  );
};

const ContextRow: React.FC<{ row: CtxRow; cols: string }> = ({ row, cols }) => {
  const frame = useCurrentFrame();
  const frac = row.trueK / BUDGET;
  const cells = 12;
  const filled = Math.min(cells, Math.round(frac * cells));
  const bar = '█'.repeat(filled) + '░'.repeat(cells - filled);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: cols,
        gap: 10,
        lineHeight: 2.1,
        color: theme.dim,
        fontVariantNumeric: 'tabular-nums',
        opacity: interpolate(frame, [0, 10], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
      }}
    >
      <span>{row.time}</span>
      <span style={{ color: theme.text }}>{SELECTED}</span>
      <span style={{ textAlign: 'right', color: theme.text }}>{row.trueK}K</span>
      <span style={{ textAlign: 'right' }}>{Math.round(row.trueK * SCALE)}K</span>
      <span style={{ textAlign: 'right' }}>{BUDGET}K</span>
      <span style={{ color: theme.faint }}>
        <span style={{ color: theme.cyan, letterSpacing: -1 }}>{bar}</span>{' '}
        {Math.round(frac * 100)}%
        {row.compacted && (
          <span style={{ color: theme.amber }}> ← compacted</span>
        )}
      </span>
    </div>
  );
};

const ContextFooter: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        marginTop: 14,
        fontSize: 14,
        color: theme.faint,
        lineHeight: 1.7,
        opacity: interpolate(frame, [0, 12], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
      }}
    >
      assumed window {ASSUMED_WINDOW}K: the client compacts against that;{' '}
      <span style={{ color: theme.dim }}>&apos;true&apos;</span> is what the model
      really held.
    </div>
  );
};

/** Caption under the window. Tracks the phase so the still frames self-explain. */
const HeroCaption: React.FC = () => {
  const frame = useCurrentFrame();

  let text: React.ReactNode = (
    <>
      A long session outgrows a small model —{' '}
      <span style={{ color: theme.text }}>the route advances instead of failing</span>.
    </>
  );
  if (frame >= PHASE_B) {
    text = (
      <>
        Actual and reported context on one scale —{' '}
        <span style={{ color: theme.text }}>
          scaling makes the client compact at the model&apos;s real limit
        </span>
        .
      </>
    );
  }
  if (frame >= PHASE_C) {
    text = (
      <>
        The smallest model that fits wins —{' '}
        <span style={{ color: theme.text }}>and nothing overfills a window</span>.
      </>
    );
  }
  if (frame >= PHASE_D) {
    text = (
      <>
        <span style={{ color: theme.text }}>agentic context</span> shows what the
        model really held, per request.
      </>
    );
  }

  return <>{text}</>;
};
