/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function Custom({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 35 36"
      aria-label="Custom"
      role="img"
      fill="none"
      {...props}
    >
      <Gradients name="Custom" />
      <path
        stroke={grad ? `url(#Custom-${grad})` : 'currentColor'}
        transform="translate(1 1)"
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="M26.5 20.8v12m-6-6h12m-28-14h4a4 4 0 004-4v-4a4 4 0 00-4-4h-4a4 4 0 00-4 4v4a4 4 0 004 4zm20 0h4a4 4 0 004-4v-4a4 4 0 00-4-4h-4a4 4 0 00-4 4v4a4 4 0 004 4zm-20 20h4a4 4 0 004-4v-4a4 4 0 00-4-4h-4a4 4 0 00-4 4v4a4 4 0 004 4z"
      />
    </svg>
  );
}
