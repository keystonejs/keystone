/** @jsx jsx */
import { jsx } from '@emotion/react';

const statusMap = {
  notStarted: {
    label: 'Not started',
    bg: 'border',
    color: 'text-heading',
  },
  figuringItOut: {
    label: 'Figuring it out',
    bg: 'warning-bg',
    color: 'text-heading',
  },
  theresAPlan: {
    label: 'There’s a plan',
    bg: 'grad4-2',
    color: 'text-heading',
  },
  makingItHappen: {
    label: 'Making it happen',
    bg: 'grad1-2',
    color: 'text-heading',
  },
  cleaningUp: {
    label: 'Cleaning up',
    bg: 'grad2-1',
    color: 'text-heading',
  },
  latestRelease: {
    label: 'Latest Release',
    bg: 'success-bg',
    color: 'text-heading',
  },
};

type StatusProps = {
  look: keyof typeof statusMap;
};
export function Status({ look }: StatusProps) {
  const status = statusMap[look];

  return (
    <span
      css={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--font-xsmall)',
        borderRadius: '0.25rem',
        padding: 'var(--space-xsmall) var(--space-medium)',
        background: `var(--${status.bg})`,
        color: `var(--${status.color})`,
      }}
    >
      {status.label}
    </span>
  );
}
