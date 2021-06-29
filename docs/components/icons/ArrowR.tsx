/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function ArrowR({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-label="Arrow right"
      role="img"
      fill="none"
      stroke={grad ? `url(#ArrowR-${grad})` : 'currentColor'}
      {...props}
    >
      <Gradients name="ArrowR" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
