// Shared design tokens for the agentic hero video. Keep in sync with the
// site's CSS custom properties in ../../public/styles.css.
export const theme = {
  bg: '#0a0a0b',
  panel: '#111114',
  panelBorder: '#26262c',
  text: '#e7e7ea',
  dim: '#8a8a93',
  faint: '#5a5a63',
  accent: '#7c7cff', // agentic violet
  accentSoft: '#a9a9ff',
  // Status colors are RESERVED for pass / warning / error and must always be
  // paired with a word or icon — never used as the sole encoding.
  green: '#4ade80',
  amber: '#fbbf24',
  red: '#f87171',
  cyan: '#5eead4',
  // Identity marks for the two anonymized eval lanes. Validated against the
  // dark panel surface for lightness, chroma, CVD separation and contrast.
  // Deliberately outside the status ramp so a lane can never read as a verdict.
  laneOne: '#7c7cff',
  laneTwo: '#008f83',
  mono: '"JetBrains Mono", "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  sans:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
} as const;

export const VIDEO = {
  fps: 30,
  width: 1280,
  height: 720,
} as const;
