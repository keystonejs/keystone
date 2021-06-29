/** @jsx jsx */
import { jsx } from '@emotion/react';
import { HTMLAttributes } from 'react';

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

type BadgeProps = {
  look?: keyof typeof styleMap;
} & HTMLAttributes<HTMLElement>;

export function Badge({ look = 'warning', ...props }: BadgeProps) {
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
