/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function Copy({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 18 18"
      aria-label="Copy"
      role="img"
      fill="none"
      {...props}
    >
      <Gradients name="Copy" />
      <path
        stroke={grad ? `url(#Copy-${grad})` : 'currentColor'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13H3C1.89543 13 1 12.1046 1 11V3C1 1.89543 1.89543 1 3 1H11C12.1046 1 13 1.89543 13 3V5M7 17H15C16.1046 17 17 16.1046 17 15V7C17 5.89543 16.1046 5 15 5H7C5.89543 5 5 5.89543 5 7V15C5 16.1046 5.89543 17 7 17Z"
      />
    </svg>
  );
}
