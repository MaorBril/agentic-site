/**
 * Poster frames and versioned asset names — the single source of truth shared
 * by the render scripts and (via `npm run assets`) the HTML contract.
 *
 * Keep POSTER_FRAME in sync with the storyboard comment in each scene:
 *   HeroContext 330 — dual-track view, actual and reported fully converged.
 *   EvalPaired  244 — both lanes graded, judge decided, aliases still hidden.
 *
 * Version suffixes are mandatory: Netlify serves these names as immutable for
 * a year, so a re-render must claim a NEW name rather than overwrite one a
 * returning visitor may already have cached.
 */
export const ASSETS = [
  {
    composition: 'HeroContext',
    name: 'hero-context-v2',
    posterFrame: 330,
  },
  {
    composition: 'EvalPaired',
    name: 'eval-paired-v1',
    posterFrame: 244,
  },
];

if (process.argv[2] === 'list') {
  for (const a of ASSETS) {
    console.log(`${a.composition}\t${a.name}\tposter=${a.posterFrame}`);
  }
}
