/** @jsx jsx */
import { jsx } from '@emotion/react';
import { HTMLAttributes } from 'react';

type PillProps = {
  grad?: 'grad1' | 'grad2' | 'grad3' | 'grad4' | 'grad5';
} & HTMLAttributes<HTMLElement>;

export function Pill({ grad = 'grad1', ...props }: PillProps) {
  return (
    <span
      css={{
        position: 'relative',
        fontSize: 'var(--font-xxsmall)',
        fontWeight: 700,
        borderRadius: '3px',
        padding: '0.25rem 0.5rem',
        textTransform: 'uppercase',
        color: `var(--${grad}-1)`,
        zIndex: 2,
        ':after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: `linear-gradient(135deg, var(--${grad}-1), var(--${grad}-2))`,
          opacity: 0.1,
          zIndex: 1,
          borderRadius: '4rem',
        },
      }}
      {...props}
    />
  );
}
