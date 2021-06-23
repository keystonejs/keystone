/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function Organization({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 44 35"
      aria-label="Organization"
      role="img"
      fill="none"
      {...props}
    >
      <Gradients name="Organization" />
      <path
        stroke={grad ? `url(#Organization-${grad})` : 'currentColor'}
        transform="translate(2 1.5)"
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="M32 42.4V5.1c0-2.6-1.8-4.7-4-4.7H8c-2.2 0-4 2-4 4.7v37.3m28 0h4m-4 0H22m-18 0H0m4 0h10M12 9.7h2m-2 9.4h2m8-9.4h2m-2 9.4h2M14 42.4V30.7c0-1.3.9-2.3 2-2.3h4c1.1 0 2 1 2 2.3v11.7m-8 0h8"
      />
    </svg>
  );
}
