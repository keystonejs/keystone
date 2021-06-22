/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function Automated({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 35 40"
      aria-label="Automated"
      role="img"
      fill="none"
      {...props}
    >
      <Gradients name="Automated" />
      <path
        transform="translate(1 1)"
        fill="none"
        fillRule="evenodd"
        stroke={grad ? `url(#Automated-${grad})` : 'currentColor'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="M20.5 14.8l-4 2m0 0l-4-2m4 2v5m16-13l-4 2m4-2l-4-2m4 2v5m-12-11l-4-2-4 2m-12 6l4-2m-4 2l4 2m-4-2v5m16 23l-4-2m4 2l4-2m-4 2v-5m-12-1l-4-2v-5m28 7l4-2v-5"
      />
    </svg>
  );
}
