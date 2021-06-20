/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function Close({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 14 14"
      aria-label="Close"
      role="img"
      fill="none"
      {...props}
    >
      <Gradients name="Close" />
      <path
        stroke={grad ? `url(#Close-${grad})` : 'currentColor'}
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M1 13L13 1M1 1l12 12"
      />
    </svg>
  );
}
