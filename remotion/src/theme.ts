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
  green: '#4ade80',
  amber: '#fbbf24',
  red: '#f87171',
  cyan: '#5eead4',
  mono: '"JetBrains Mono", "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  sans:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
} as const;

export const VIDEO = {
  fps: 30,
  width: 1280,
  height: 720,
} as const;
