import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { theme } from '../theme';

/** Shared entrance easing for every composition. */
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * The terminal window every composition lives in: traffic-light chrome, a
 * title, a body, and an optional pinned footer (the statusline) plus a caption
 * rendered under the window.
 *
 * Extracted from the inline chrome that used to be duplicated inside
 * SceneDemo so the hero and eval scenes share one surface.
 */
export const TerminalPanel: React.FC<{
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  caption?: React.ReactNode;
  width?: number;
  height?: number;
  enterAt?: number;
  enterDur?: number;
  captionAt?: number;
}> = ({
  title,
  children,
  footer,
  caption,
  width = 1080,
  height = 600,
  enterAt = 0,
  enterDur = 16,
  captionAt = 40,
}) => {
  const frame = useCurrentFrame();
  const windowO = interpolate(frame, [enterAt, enterAt + enterDur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOut,
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
          width,
          height,
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
            {title}
          </span>
        </div>

        <div
          style={{
            flex: 1,
            padding: '24px 30px',
            fontSize: 19,
            lineHeight: 1.7,
            position: 'relative',
          }}
        >
          {children}
        </div>

        {footer}
      </div>

      {caption && (
        <div
          style={{
            marginTop: 26,
            fontFamily: theme.sans,
            fontSize: 21,
            color: theme.dim,
            opacity: interpolate(frame, [captionAt, captionAt + 20], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          {caption}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const Dot: React.FC<{ color: string }> = ({ color }) => (
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

/** Middot separator used between statusline segments. */
export const Sep: React.FC = () => <span style={{ color: theme.faint }}>·</span>;

/** A shell prompt line: violet chevron plus content. */
export const PromptLine: React.FC<{
  children: React.ReactNode;
  marginTop?: number;
}> = ({ children, marginTop }) => (
  <div style={{ marginTop, display: 'flex', gap: 12 }}>
    <span style={{ color: theme.accent }}>❯</span>
    {children}
  </div>
);
