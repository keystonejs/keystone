/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function DarkMode({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      aria-label="Dark Mode"
      role="img"
      fill="none"
      {...props}
    >
      <Gradients name="DarkMode" />
      <path
        fill="none"
        fillRule="evenodd"
        stroke={grad ? `url(#DarkMode-${grad})` : 'currentColor'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M18.68 13.05a9 9 0 01-11.7-11.7 9 9 0 1011.7 11.7z"
      />
    </svg>
  );
}
