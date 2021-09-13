/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function Content({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-label="Content"
      role="img"
      fill="none"
      stroke={grad ? `url(#Content-${grad})` : 'currentColor'}
      {...props}
    >
      <Gradients name="Content" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
      />
    </svg>
  );
}
