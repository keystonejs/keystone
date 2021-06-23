/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function WhyKeystone({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      aria-label="Why Keystone"
      role="img"
      fill="none"
      {...props}
    >
      <Gradients name="WhyKeystone" />
      <path
        stroke={grad ? `url(#WhyKeystone-${grad})` : 'currentColor'}
        fill="none"
        transform="translate(1 1)"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
        d="M2 0v4M0 2h4M3 14v4m-2-2h4m5-16l2.3 6.9L18 9l-5.7 2.1L10 18l-2.3-6.9L2 9l5.7-2.1L10 0z"
      />
    </svg>
  );
}
