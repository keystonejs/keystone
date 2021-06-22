/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function Docs({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 18"
      aria-label="Docs"
      role="img"
      fill="none"
      {...props}
    >
      <Gradients name="Docs" />
      <path
        stroke={grad ? `url(#Docs-${grad})` : 'currentColor'}
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M10 11l9-5-9-5-9 5 9 5zm0 0l6.2-3.4a12 12 0 01.6 6.5 12 12 0 00-6.8 3 12 12 0 00-6.8-3 12 12 0 01.6-6.5L10 11zm-4 6V9.5l4-2.2"
      />
    </svg>
  );
}
