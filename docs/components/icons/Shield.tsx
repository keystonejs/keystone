/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function Shield({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 39 39"
      aria-label="Shield"
      role="img"
      fill="none"
      {...props}
    >
      <Gradients name="Shield" />
      <path
        stroke={grad ? `url(#Shield-${grad})` : 'currentColor'}
        fill="none"
        transform="translate(1 1)"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="M12.5 18.8l4 4 8-8m11.2-8A24.4 24.4 0 0118.5.7a24 24 0 01-17.2 6 24 24 0 0017.2 29.4A24 24 0 0035.7 6.8z"
      />
    </svg>
  );
}
