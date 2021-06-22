/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function Lab({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 22 18"
      aria-label="Lab"
      role="img"
      fill="none"
      {...props}
    >
      <Gradients name="Lab" />
      <path
        stroke={grad ? `url(#Lab-${grad})` : 'currentColor'}
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M18.4 12.4a2 2 0 00-1-.5l-2.4-.5a6 6 0 00-3.8.5l-.4.2a6 6 0 01-3.8.5l-2-.4a2 2 0 00-1.8.6M7 1h8l-1 1v5.2c0 .5.2 1 .6 1.4l5 5a2 2 0 01-1.4 3.4H3.8a2 2 0 01-1.4-3.4l5-5c.4-.4.6-.9.6-1.4V2L7 1z"
      />
    </svg>
  );
}
