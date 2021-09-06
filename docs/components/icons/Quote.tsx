/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function Quote({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 33 25"
      aria-label="Quote"
      role="img"
      fill="none"
      {...props}
    >
      <Gradients name="Quote" />
      <path
        fill={grad ? `url(#Quote-${grad})` : 'currentColor'}
        d="M0.500189 24.8163H12.1005V17.1574C12.0676 11.7727 13.5835 7.72584 15.9563 3.81275L9.10158 0C4.75145 3.64552 0.467233 10.8362 0.500189 17.1908V24.8163ZM17.0439 24.8163H28.6442V17.1574C28.6112 11.7727 30.1272 7.72584 32.5 3.81275L25.6453 0C21.2951 3.64552 17.0109 10.8362 17.0439 17.1908V24.8163Z"
      />
    </svg>
  );
}
