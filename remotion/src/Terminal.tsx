import React from 'react';
import { AbsoluteFill } from 'remotion';
import { theme } from './theme';

/** Terminal window chrome with traffic-light dots and a title. */
export const TerminalWindow: React.FC<{
  title?: string;
  children: React.ReactNode;
  scale?: number;
}> = ({ title = 'agentic', children, scale = 1 }) => {
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
          width: 980,
          transform: `scale(${scale})`,
          borderRadius: 14,
          overflow: 'hidden',
          border: `1px solid ${theme.panelBorder}`,
          backgroundColor: theme.panel,
          boxShadow: '0 40px 120px rgba(0,0,0,0.6)',
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
          <span
            style={{
              marginLeft: 12,
              color: theme.dim,
              fontSize: 15,
              letterSpacing: 0.3,
            }}
          >
            {title}
          </span>
        </div>
        <div style={{ padding: '26px 30px', minHeight: 380 }}>{children}</div>
      </div>
    </AbsoluteFill>
  );
};

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

/** Prompt line prefix: violet chevron. */
export const Prompt: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div style={{ display: 'flex', gap: 12, fontSize: 24, lineHeight: 1.6 }}>
    <span style={{ color: theme.accent }}>❯</span>
    <span style={{ color: theme.text }}>{children}</span>
  </div>
);
