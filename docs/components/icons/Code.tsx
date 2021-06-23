/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function Code({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 44 35"
      aria-label="Code"
      role="img"
      fill="none"
      {...props}
    >
      <Gradients name="Code" />
      <path
        stroke={grad ? `url(#Code-${grad})` : 'currentColor'}
        transform="translate(2 1)"
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="M16 32.4l8-32m8 8l8 8-8 8m-24 0l-8-8 8-8"
      />
    </svg>
  );
}
