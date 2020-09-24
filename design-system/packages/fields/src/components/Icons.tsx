/** @jsx jsx */

import { ReactNode } from 'react';
import { jsx } from '@keystone-ui/core';

type SvgProps = { children: ReactNode; size: string | number; stroke?: string; fill?: string };
const Svg = ({ children, size, stroke = 'none', fill = 'none' }: SvgProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    css={{
      verticalAlign: 'text-bottom', // removes whitespace inside buttons
      fill,
      stroke,
      strokeLinejoin: 'round',
      strokeLinecap: 'round',
      strokeWidth: 3,
    }}
    height={`${size}px`}
    width={`${size}px`}
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    {children}
  </svg>
);

export const CheckIcon = () => {
  return (
    <Svg size="18" stroke="currentColor">
      <polyline points="20 6 10 18 4 12" />
    </Svg>
  );
};

export const DotIcon = () => {
  return (
    <Svg size="16" fill="currentColor">
      <circle cx="12" cy="12" r="8" />
    </Svg>
  );
};
