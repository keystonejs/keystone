/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function Content({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 36"
      aria-label="Content"
      role="img"
      fill="none"
      {...props}
    >
      <Gradients name="Content" />
      <path
        stroke={grad ? `url(#Content-${grad})` : 'currentColor'}
        transform="translate(2 .5)"
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="M32 33.4H4a4 4 0 01-4-4v-24a4 4 0 014-4h20a4 4 0 014 4v2m4 26a4 4 0 01-4-4v-22m4 26a4 4 0 004-4v-18a4 4 0 00-4-4h-4m-8-6h-8m-4 24h12M8 9.4h12v8H8v-8z"
      />
    </svg>
  );
}
