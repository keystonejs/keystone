/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function Relational({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 39 40"
      aria-label="Relational"
      role="img"
      fill="none"
      {...props}
    >
      <Gradients name="Relational" />
      <path
        stroke={grad ? `url(#Relational-${grad})` : 'currentColor'}
        transform="translate(1 1)"
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="M11.9 21.5a6 6 0 000-5.4m0 5.4a6 6 0 110-5.4m0 5.4L25 28.1M12 16.1L25 9.5m0 0A6 6 0 1036 4.1 6 6 0 0025 9.5zm0 18.6a6 6 0 1010.7 5.4 6 6 0 00-10.7-5.4z"
      />
    </svg>
  );
}
