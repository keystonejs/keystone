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

const checkSizeMap = {
  small: 14,
  medium: 18,
  large: 24,
};
export const CheckIcon = ({ size = 'medium' }: { size?: keyof typeof checkSizeMap }) => {
  return (
    <Svg size={checkSizeMap[size]} stroke="currentColor">
      <polyline points="20 6 10 18 4 12" />
    </Svg>
  );
};

const dotSizeMap = {
  small: 12,
  medium: 16,
  large: 20,
};
export const DotIcon = ({ size = 'medium' }: { size?: keyof typeof dotSizeMap }) => {
  return (
    <Svg size={dotSizeMap[size]} fill="currentColor">
      <circle cx="12" cy="12" r="8" />
    </Svg>
  );
};
