/** @jsx jsx */
import { ReactNode } from 'react';
import { jsx } from '@keystone-ui/core';

interface StatusProps {
  children: ReactNode;
  look:
    | 'default'
    | 'notStarted'
    | 'figuringItOut'
    | 'theresAPlan'
    | 'makingItHappen'
    | 'cleaningUp';
}
export function Status({ look = 'default', children }: StatusProps) {
  const styleMap = {
    default: {
      color: '#1a202c',
      backgroundColor: '#eff4f8',
    },
    notStarted: {
      color: '#bf4722',
      backgroundColor: '#faeae5',
    },
    figuringItOut: {
      color: '#c05621',
      backgroundColor: '#feebc8',
    },
    theresAPlan: {
      color: '#6b46c1',
      backgroundColor: '#e9d8fd',
    },
    makingItHappen: {
      color: '#2b6cb0',
      backgroundColor: '#bee3f8',
    },
    cleaningUp: {
      color: '#2f855a',
      backgroundColor: '#c6f6d5',
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
        ...styleMap[look],
      }}
    >
      {children}
    </span>
  );
}
