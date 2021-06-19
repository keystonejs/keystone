/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function ArrowRLong({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 8"
      aria-label="Arrow right"
      role="img"
      fill="none"
      {...props}
    >
      <Gradients name="ArrowRLong" />
      <path
        stroke={grad ? `url(#ArrowRLong-${grad})` : 'currentColor'}
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.25"
        d="M8 1l3 3m0 0L8 7m3-3H1"
      />
    </svg>
  );
}
