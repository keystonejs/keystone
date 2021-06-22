/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function Watch({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 39 40"
      aria-label="Watch"
      role="img"
      fill="none"
      {...props}
    >
      <Gradients name="Watch" />

      <path
        stroke={grad ? `url(#Watch-${grad})` : 'currentColor'}
        transform="translate(1 1)"
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="M18.5 10.8v8l6 6m12-6a18 18 0 11-36 0 18 18 0 0136 0z"
      />
    </svg>
  );
}
