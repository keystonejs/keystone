/** @jsx jsx */
import { jsx } from '@keystone-ui/core';

const statusMap = {
  notStarted: {
    label: 'Not started',
    color: '#666666',
    backgroundColor: '#eeeeee',
  },
  figuringItOut: {
    label: 'Figuring it out',
    color: '#D97706',
    backgroundColor: '#FEF3C7',
  },
  theresAPlan: {
    label: 'There’s a plan',
    color: '#DB2777',
    backgroundColor: '#FCE7F3',
  },
  makingItHappen: {
    label: 'Making it happen',
    color: '#1D4ED8',
    backgroundColor: '#DBEAFE',
  },
  cleaningUp: {
    label: 'Cleaning up',
    color: '#15803D',
    backgroundColor: '#DCFCE7',
  },
};

type StatusProps = {
  look: keyof typeof statusMap;
};
export function Status({ look }: StatusProps) {
  const status = statusMap[look];
  const styles = {
    '&::before': {
      display: 'none',
    },
    '&::after': {
      display: 'none',
    },
    fontSize: '85%',
    fontFamily: 'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace',
    padding: '0.25rem 0.375rem',
    borderRadius: 6,
    color: status.color,
    backgroundColor: status.backgroundColor,
  };

  return <span css={styles}>{status.label}</span>;
}
