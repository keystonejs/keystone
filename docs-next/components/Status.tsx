/** @jsx jsx */
import { jsx } from '@keystone-ui/core';

interface StatusProps {
  look: 'notStarted' | 'figuringItOut' | 'theresAPlan' | 'makingItHappen' | 'cleaningUp';
}
export function Status({ look }: StatusProps) {
  const statusMap = {
    notStarted: {
      label: 'Not started',
      icon: '🛑',
      color: '#DC2626',
      backgroundColor: '#FEE2E2',
    },
    figuringItOut: {
      label: 'Figuring it out',
      icon: '🖊️',
      color: '#D97706',
      backgroundColor: '#FEF3C7',
    },
    theresAPlan: {
      label: 'There’s a plan',
      icon: '📋',
      color: '#DB2777',
      backgroundColor: '#FCE7F3',
    },
    makingItHappen: {
      label: 'Making it happen',
      icon: '🔧',
      color: '#1D4ED8',
      backgroundColor: '#DBEAFE',
    },
    cleaningUp: {
      label: 'Cleaning up',
      icon: '🧹',
      color: '#15803D',
      backgroundColor: '#DCFCE7',
    },
  };

  const commonStyles = {
    '&::before': {
      display: 'none',
    },
    '&::after': {
      display: 'none',
    },
    fontSize: '85%',
    fontFamily: 'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace',
    padding: '0.25rem 0.375rem',
    borderRadius: '0.125rem',
  };

  return (
    <span
      css={{
        ...commonStyles,
        ...statusMap[look],
      }}
    >
      <span aria-hidden="true" role="img">
        {statusMap[look].icon}
      </span>{' '}
      {statusMap[look].label}
    </span>
  );
}
