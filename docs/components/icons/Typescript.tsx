/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function Typescript({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-label="Typescript"
      role="img"
      fill="none"
      stroke={grad ? `url(#Typescript-${grad})` : 'currentColor'}
      {...props}
    >
      <Gradients name="Typescript" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11.0278 6H7.02777H3.02777 M7.02777 6V18 M20.9723 8.30769C20.9723 7.84615 20.0973 6 17.4723 6C14.8473 6 13.9723 7.84615 13.9723 8.76923C13.9723 10.6154 14.8473 11.5385 17.4723 12C20.0973 12.4615 20.9723 13.3846 20.9723 15.2308C20.9723 16.1538 20.0973 18 17.4723 18C14.8473 18 13.9723 16.1538 13.9723 15.6923"
      />
    </svg>
  );
}
