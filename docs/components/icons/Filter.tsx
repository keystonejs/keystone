/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function Filter({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 39 40"
      aria-label="Filter"
      role="img"
      fill="none"
      {...props}
    >
      <Gradients name="Filter" />
      <path
        stroke={grad ? `url(#Filter-${grad})` : 'currentColor'}
        transform="translate(1 1)"
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="M.5 1.8c0-.5.4-1 1-1h34c.6 0 1 .5 1 1v6.6c0 .3-.1.5-.3.7L22.8 22.5a1 1 0 00-.3.7v5.6l-8 8V23.2a1 1 0 00-.3-.7L.8 9.1a1 1 0 01-.3-.7V1.8z"
      />
    </svg>
  );
}
