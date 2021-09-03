/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function Watch({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-label="Watch"
      role="img"
      fill="none"
      stroke={grad ? `url(#Watch-${grad})` : 'currentColor'}
      {...props}
    >
      <Gradients name="Watch" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
