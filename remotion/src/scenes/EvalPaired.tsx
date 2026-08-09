import React from 'react';
import { interpolate, Sequence, useCurrentFrame } from 'remotion';
import { theme } from '../theme';
import { Typewriter } from '../anim';
import { PromptLine, TerminalPanel, easeOut } from '../components/TerminalPanel';
import { ResultLines, Spinner, Tag } from '../components/Chrome';

/**
 * EvalPaired — "compare models on the work you actually run".
 *
 * Two candidates run the same task in isolated clones. Identical verifier,
 * identical official SWE-bench grading. A blinded judge reads both scrubbed
 * result sets as CANDIDATE 1 / CANDIDATE 2, picks one, and only then are the
 * aliases disclosed.
 *
 * The framing is deliberately conservative: the harness is labelled
 * new/experimental throughout, the example is labelled n=1, and the honest
 * result is stated — BOTH patches passed the official grader; the judge merely
 * preferred one patch's match to the upstream fix. Nothing here implies a
 * win rate or a general model ranking.
 *
 * Timeline (30fps, 390 frames = 13s):
 *    0– 60  window in, `agentic eval run` types, experimental badge
 *   60–190  two anonymized lanes step through identical stages
 *  190–250  blinded judge reads both scrubbed result sets
 *  250–300  preference, then alias reveal with the n=1 caveat
 *  300–420  `agentic eval report` with cost / tokens / latency telemetry
 */

export const EVAL_PAIRED_DURATION = 420;
/**
 * Poster frame: both lanes graded, judge verdict settled, aliases still hidden.
 * Mirrored in `posters.mjs`, which is what the render scripts actually read.
 */
export const EVAL_PAIRED_POSTER = 244;

const TASK = 'astropy__astropy-14309';
const JUDGE_AT = 190;
const REVEAL_AT = 250;
const REPORT_AT = 300;

export const EvalPaired: React.FC = () => {
  return (
    <TerminalPanel
      title="agentic eval — paired, blinded model comparison"
      caption={<EvalCaption />}
      captionAt={40}
      height={604}
    >
      <PromptLine>
        <Typewriter
          text="agentic eval run swebench-smoke.yaml --judge sonnet"
          startFrame={8}
          duration={40}
          hideCaretAfter={56}
        />
      </PromptLine>

      <Sequence name="Experimental framing" from={56} layout="none">
        <RunHeader />
      </Sequence>

      <Sequence
        name="Paired lanes"
        from={78}
        durationInFrames={REPORT_AT - 78}
        layout="none"
      >
        <Lanes />
      </Sequence>

      <Sequence
        name="Blinded judge"
        from={JUDGE_AT}
        durationInFrames={REPORT_AT - JUDGE_AT}
        layout="none"
      >
        <JudgeCard />
      </Sequence>

      <Sequence
        name="Report telemetry"
        from={REPORT_AT}
        durationInFrames={EVAL_PAIRED_DURATION - REPORT_AT}
        layout="none"
      >
        <ReportBlock />
      </Sequence>
    </TerminalPanel>
  );
};

const RunHeader: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        marginTop: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: 14,
        opacity: interpolate(frame, [0, 12], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: easeOut,
        }),
      }}
    >
      <Tag color={theme.amber}>new · experimental</Tag>
      <span style={{ color: theme.dim }}>
        task <span style={{ color: theme.text }}>{TASK}</span>
      </span>
      <span style={{ color: theme.faint }}>·</span>
      <span style={{ color: theme.faint }}>
        SWE-bench Verified · 1 pair · seed 1
      </span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Paired lanes. Candidate identity is a lane NAME plus a shape glyph; the
// lane colours sit outside the status ramp so a lane can never be misread as
// a verdict. Every stage state is a word plus an icon.
// ---------------------------------------------------------------------------

type Stage = {
  label: string;
  /** Frames, relative to the lane's own start, when this stage completes. */
  doneAt: number;
  detail: string;
};

const STAGES_ONE: Stage[] = [
  { label: 'workspace', doneAt: 18, detail: 'isolated clone' },
  { label: 'patch', doneAt: 48, detail: '1 file · 14 lines' },
  { label: 'verifier', doneAt: 76, detail: 'passed' },
  { label: 'swe-bench grader', doneAt: 104, detail: 'resolved' },
];

const STAGES_TWO: Stage[] = [
  { label: 'workspace', doneAt: 22, detail: 'isolated clone' },
  { label: 'patch', doneAt: 56, detail: '2 files · 31 lines' },
  { label: 'verifier', doneAt: 86, detail: 'passed' },
  { label: 'swe-bench grader', doneAt: 112, detail: 'resolved' },
];

const Lanes: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ marginTop: 18 }}>
      <div
        style={{
          fontSize: 13,
          color: theme.faint,
          marginBottom: 10,
          opacity: interpolate(frame, [0, 10], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        identical task · identical verifier · identical official grader ·
        candidate order randomized
      </div>
      <div style={{ display: 'flex', gap: 18 }}>
        <Lane
          name="Candidate 1"
          glyph="●"
          color={theme.laneOne}
          stages={STAGES_ONE}
          start={4}
        />
        <Lane
          name="Candidate 2"
          glyph="■"
          color={theme.laneTwo}
          stages={STAGES_TWO}
          start={4}
        />
      </div>
    </div>
  );
};

const Lane: React.FC<{
  name: string;
  glyph: string;
  color: string;
  stages: Stage[];
  start: number;
}> = ({ name, glyph, color, stages, start }) => {
  const frame = useCurrentFrame();
  const local = frame - start;
  const graded = local >= stages[stages.length - 1].doneAt;
  // The alias is withheld until after the judge has decided.
  const revealed = frame >= REVEAL_AT - 78;
  const alias = name === 'Candidate 1' ? 'opus (baseline)' : 'kimi-k3 (mut)';

  return (
    <div
      style={{
        flex: 1,
        border: `1px solid ${color}44`,
        backgroundColor: `${color}0d`,
        borderRadius: 10,
        padding: '14px 16px',
        opacity: interpolate(frame, [start, start + 12], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: easeOut,
        }),
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 12,
        }}
      >
        <span style={{ color, fontSize: 17 }}>{glyph}</span>
        <span style={{ color, fontSize: 16, letterSpacing: 0.5 }}>{name}</span>
        <span style={{ marginLeft: 'auto', fontSize: 13 }}>
          {revealed ? (
            <span style={{ color: theme.text }}>{alias}</span>
          ) : (
            <span style={{ color: theme.faint }}>alias hidden</span>
          )}
        </span>
      </div>

      {stages.map((s) => (
        <StageRow key={s.label} stage={s} local={local} color={color} />
      ))}

      {graded && <LaneVerdict at={stages[stages.length - 1].doneAt + 4} local={local} />}
    </div>
  );
};

const StageRow: React.FC<{ stage: Stage; local: number; color: string }> = ({
  stage,
  local,
  color,
}) => {
  // Each stage starts 22 frames before it completes.
  const startAt = stage.doneAt - 22;
  const pending = local < startAt;
  const done = local >= stage.doneAt;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 15,
        lineHeight: 1.95,
        color: pending ? theme.faint : theme.dim,
      }}
    >
      <span style={{ width: 16, display: 'inline-block' }}>
        {pending ? (
          <span style={{ color: theme.faint }}>·</span>
        ) : (
          <Sequence name={`${stage.label} spinner`} from={startAt} layout="none">
            <Spinner doneAt={stage.doneAt - startAt} color={color} />
          </Sequence>
        )}
      </span>
      <span style={{ minWidth: 148, color: done ? theme.text : undefined }}>
        {stage.label}
      </span>
      <span style={{ fontSize: 13, color: theme.faint }}>
        {pending ? 'queued' : done ? stage.detail : 'running…'}
      </span>
    </div>
  );
};

const LaneVerdict: React.FC<{ at: number; local: number }> = ({ at, local }) => (
  <div
    style={{
      marginTop: 12,
      paddingTop: 10,
      borderTop: `1px solid ${theme.panelBorder}`,
      fontSize: 14,
      opacity: interpolate(local, [at, at + 10], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }),
    }}
  >
    <span style={{ color: theme.green }}>✓</span>{' '}
    <span style={{ color: theme.text }}>complete / pass</span>{' '}
    <span style={{ color: theme.faint }}>· resolved by official grader</span>
  </div>
);

// ---------------------------------------------------------------------------
// Blinded judge.
// ---------------------------------------------------------------------------

const JudgeCard: React.FC = () => {
  const frame = useCurrentFrame();
  const decided = frame >= 40;
  const revealed = frame >= REVEAL_AT - JUDGE_AT;

  return (
    <div
      style={{
        marginTop: 16,
        border: `1px solid ${theme.panelBorder}`,
        backgroundColor: '#0e0e12',
        borderRadius: 10,
        padding: '14px 18px',
        opacity: interpolate(frame, [0, 14], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: easeOut,
        }),
        translate: `0px ${interpolate(frame, [0, 14], [8, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: easeOut,
        })}px`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 15,
        }}
      >
        <Spinner doneAt={40} color={theme.accentSoft} />
        <Tag color={theme.accent}>blinded judge</Tag>
        <span style={{ color: theme.dim }}>
          {decided
            ? 'read both scrubbed result sets'
            : 'reading both scrubbed result sets…'}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: theme.faint }}>
          names, order and cost withheld
        </span>
      </div>

      {decided && (
        <div
          style={{
            marginTop: 12,
            fontSize: 15,
            color: theme.dim,
            opacity: interpolate(frame, [40, 52], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            lineHeight: 1.75,
          }}
        >
          winner <span style={{ color: theme.laneOne }}>● candidate_1</span>{' '}
          <span style={{ color: theme.faint }}>· confidence 0.62 ·</span>{' '}
          <span style={{ color: theme.text }}>
            closer match to the upstream fix
          </span>
          {revealed && (
            <div
              style={{
                marginTop: 8,
                fontSize: 14,
                color: theme.amber,
                opacity: interpolate(
                  frame,
                  [REVEAL_AT - JUDGE_AT, REVEAL_AT - JUDGE_AT + 12],
                  [0, 1],
                  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                ),
              }}
            >
              ⚠ n=1 smoke test — both patches passed the official grader. The
              judge preferred one patch&apos;s match to the upstream fix. Not a
              win rate.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Report telemetry.
// ---------------------------------------------------------------------------

const ReportBlock: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        marginTop: 18,
        opacity: interpolate(frame, [0, 12], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: easeOut,
        }),
      }}
    >
      <PromptLine>
        <Typewriter
          text="agentic eval report out/swebench-smoke"
          startFrame={2}
          duration={26}
          hideCaretAfter={34}
        />
      </PromptLine>

      <Sequence name="Report summary" from={36} layout="none">
        <ResultLines
          marginTop={16}
          stagger={10}
          color={theme.dim}
          lines={[
            {
              icon: ' ',
              text: 'swebench-smoke: baseline=opus mut=kimi-k3 judge=sonnet pairs=1',
            },
            {
              icon: ' ',
              text: 'wins: baseline 1 · mut 0 · ties 0 · judge errors 0 · infra pairs 0',
            },
            {
              icon: ' ',
              text: 'verifier passes: baseline 1 · mut 1 — run failures: baseline 0 · mut 0',
              muted: true,
            },
          ]}
        />
      </Sequence>

      <Sequence name="Telemetry row" from={72} layout="none">
        <Telemetry />
      </Sequence>

      <Sequence name="Report caveat" from={104} layout="none">
        <ReportCaveat />
      </Sequence>
    </div>
  );
};

/**
 * The caveat rides along with the numbers, so no single frame of the report
 * phase can be screenshotted as a general performance claim.
 */
const ReportCaveat: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        marginTop: 18,
        fontSize: 13,
        color: theme.amber,
        lineHeight: 1.7,
        opacity: interpolate(frame, [0, 12], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
      }}
    >
      ⚠ n=1 smoke test · one task, one attempt — telemetry for this run only,
      not a benchmark result
    </div>
  );
};

const TELEMETRY: { label: string; one: string; two: string }[] = [
  { label: 'cost_usd', one: '$0.8241', two: '$0.0913' },
  { label: 'tokens (in / out)', one: '184K / 6.2K', two: '191K / 7.8K' },
  { label: 'duration_ms', one: '142,880', two: '96,410' },
];

const Telemetry: React.FC = () => {
  const frame = useCurrentFrame();
  const cols = '230px 1fr 1fr';
  return (
    <div
      style={{
        marginTop: 18,
        fontSize: 14,
        opacity: interpolate(frame, [0, 12], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: cols,
          gap: 12,
          color: theme.faint,
          fontSize: 13,
          paddingBottom: 6,
          borderBottom: `1px solid ${theme.panelBorder}`,
        }}
      >
        <span>telemetry</span>
        <span style={{ color: theme.laneOne }}>● opus (baseline)</span>
        <span style={{ color: theme.laneTwo }}>■ kimi-k3 (mut)</span>
      </div>
      {TELEMETRY.map((t, i) => (
        <div
          key={t.label}
          style={{
            display: 'grid',
            gridTemplateColumns: cols,
            gap: 12,
            lineHeight: 2.2,
            color: theme.dim,
            fontVariantNumeric: 'tabular-nums',
            opacity: interpolate(frame, [i * 8, i * 8 + 10], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          <span>{t.label}</span>
          <span style={{ color: theme.text }}>{t.one}</span>
          <span style={{ color: theme.text }}>{t.two}</span>
        </div>
      ))}
    </div>
  );
};

const EvalCaption: React.FC = () => {
  const frame = useCurrentFrame();

  if (frame >= REPORT_AT) {
    return (
      <>
        <span style={{ color: theme.text }}>agentic eval report</span> — cost,
        tokens and latency per arm.
      </>
    );
  }
  if (frame >= REVEAL_AT) {
    return (
      <>
        Aliases disclosed only after the verdict —{' '}
        <span style={{ color: theme.text }}>this example is n=1</span>.
      </>
    );
  }
  if (frame >= JUDGE_AT) {
    return (
      <>
        A blinded judge reads both —{' '}
        <span style={{ color: theme.text }}>names and order withheld</span>.
      </>
    );
  }
  return (
    <>
      Two candidates, same task, same grader —{' '}
      <span style={{ color: theme.text }}>identities hidden until the verdict</span>.
    </>
  );
};
