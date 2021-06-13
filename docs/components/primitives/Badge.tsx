/** @jsx jsx */
import { jsx } from '@keystone-ui/core';

const styleMap = {
  success: {
    color: 'var(--success)',
    background: 'var(--success-bg)',
  },
  warning: {
    color: 'var(--warning)',
    background: 'var(--warning-bg)',
  },
  info: {
    color: 'var(--info)',
    background: 'var(--info-bg)',
  },
  danger: {
    color: 'var(--danger)',
    background: 'var(--danger-bg)',
  },
};

export function Badge({ look = 'warning', ...props }) {
  return (
    <span
      css={{
        fontSize: 'var(--font-xxsmall)',
        fontWeight: 700,
        borderRadius: '3px',
        padding: 'var(--space-xxsmall) var(--space-xsmall)',
        textTransform: 'uppercase',
        ...styleMap[look],
      }}
      {...props}
    />
  );
}
