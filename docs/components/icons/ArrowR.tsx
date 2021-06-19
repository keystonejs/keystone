/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Grad } from './util';

export function ArrowR({ grad, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 7 12"
      aria-label="Arrow right"
      role="img"
      fill="none"
      {...props}
    >
      <Grad name="ArrowR" />
      <path
        stroke={grad ? `url(#ArrowR-${grad})` : 'currentColor'}
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M1 1.3L5.7 6 1 10.7"
      />
    </svg>
  );
}
