import React from 'react';
import type { ConnectionLineComponentProps } from 'reactflow';

const CONNECTION_LINE_VALID = 'var(--color-connection-valid, #22c55e)';
const CONNECTION_LINE_INVALID = 'var(--color-connection-invalid, #ef4444)';
const CONNECTION_LINE_DEFAULT = 'var(--color-primary-light, #a78bfa)';

export const CustomConnectionLine: React.FC<ConnectionLineComponentProps> = ({
  fromX,
  fromY,
  toX,
  toY,
  connectionStatus,
}) => {
  const stroke =
    connectionStatus === 'valid'
      ? CONNECTION_LINE_VALID
      : connectionStatus === 'invalid'
        ? CONNECTION_LINE_INVALID
        : CONNECTION_LINE_DEFAULT;

  return (
    <g>
      <path
        fill="none"
        className="react-flow__connection-path"
        d={`M ${fromX},${fromY} L ${toX},${toY}`}
        stroke={stroke}
        strokeWidth={2}
        strokeDasharray={connectionStatus === 'invalid' ? '5,5' : undefined}
      />
    </g>
  );
};
