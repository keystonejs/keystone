/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function Cli({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 34 31"
      aria-label="Cli"
      role="img"
      fill="none"
      {...props}
    >
      <Gradients name="Cli" />
      <path
        stroke={grad ? `url(#Cli-${grad})` : 'currentColor'}
        transform="translate(2 2)"
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="M8.3 8.6l5 5-5 5m8.4 0h5M3.3 26.9h23.4c1.8 0 3.3-1.5 3.3-3.3v-20C30 1.7 28.5.2 26.7.2H3.3A3.3 3.3 0 000 3.6v20c0 1.8 1.5 3.3 3.3 3.3z"
      />
    </svg>
  );
}
