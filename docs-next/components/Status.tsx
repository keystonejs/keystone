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
  const styles = `
    rounded font-mono text-sm py-1 px-2
    bg-${status.color}-100
    text-${status.color}-700
  `;

  return <span className={styles}>{status.label}</span>;
}
