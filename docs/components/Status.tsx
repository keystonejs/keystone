/** @jsx jsx */
import { jsx } from '@keystone-ui/core';

const statusMap = {
  notStarted: {
    label: 'Not started',
    color: 'gray',
  },
  figuringItOut: {
    label: 'Figuring it out',
    color: 'orange',
  },
  theresAPlan: {
    label: 'There’s a plan',
    color: 'pink',
  },
  makingItHappen: {
    label: 'Making it happen',
    color: 'blue',
  },
  cleaningUp: {
    label: 'Cleaning up',
    color: 'green',
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
        background: `var(--${status.color}-100)`,
        color: `var(--${status.color}-700)`,
      }}
    >
      {status.label}
    </span>
  );
}
