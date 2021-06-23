/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function Relationship({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 34 33"
      aria-label="Relationship"
      role="img"
      fill="none"
      {...props}
    >
      <Gradients name="Relationship" />
      <path
        stroke={grad ? `url(#Relationship-${grad})` : 'currentColor'}
        transform="translate(2 1)"
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="M15 2.8a6.7 6.7 0 0111.7 4.4A6.7 6.7 0 0115 11.6m5 19H0v-1.7a10 10 0 1120 0v1.7zm0 0h10v-1.7a10 10 0 00-15-8.7m1.7-13a6.7 6.7 0 11-13.4 0 6.7 6.7 0 0113.4 0z"
      />
    </svg>
  );
}
