/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function Hamburger({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 18"
      aria-label="Hamburger"
      role="img"
      fill="none"
      {...props}
    >
      <Gradients name="Hamburger" />
      <path
        stroke={grad ? `url(#Hamburger-${grad})` : 'currentColor'}
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M1.3 1h21.4M1.3 9h21.4M1.3 17h21.4"
      />
    </svg>
  );
}
