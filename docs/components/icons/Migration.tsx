/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function Migration({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 35 40"
      aria-label="Migration"
      role="img"
      fill="none"
      {...props}
    >
      <Gradients name="Migration" />
      <path
        stroke={grad ? `url(#Migration-${grad})` : 'currentColor'}
        transform="translate(1 1)"
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="M8.5 8.8h24m0 0l-8-8m8 8l-8 8m0 12H.5m0 0l8 8m-8-8l8-8"
      />
    </svg>
  );
}
