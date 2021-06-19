/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function LightMode({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      aria-label="Light Mode"
      role="img"
      fill="none"
      {...props}
    >
      <Gradients name="LightMode" />
      <path
        stroke={grad ? `url(#LightMode-${grad})` : 'currentColor'}
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M10 1v1m0 16v1m9-9h-1M2 10H1m15.36 6.36l-.7-.7M4.34 4.34l-.7-.7m12.72 0l-.7.7M4.34 15.66l-.7.7M14 10a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}
