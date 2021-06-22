/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function Tick({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 17"
      aria-label="Tick"
      role="img"
      fill="none"
      {...props}
    >
      <Gradients name="Tick" />
      <path
        fill={grad ? `url(#Tick-${grad})` : 'currentColor'}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 16.6326C12.4183 16.6326 16 13.0508 16 8.63257C16 4.21429 12.4183 0.632568 8 0.632568C3.58172 0.632568 0 4.21429 0 8.63257C0 13.0508 3.58172 16.6326 8 16.6326ZM11.7071 7.33967C12.0976 6.94915 12.0976 6.31599 11.7071 5.92546C11.3166 5.53494 10.6834 5.53494 10.2929 5.92546L7 9.21835L5.70711 7.92546C5.31658 7.53494 4.68342 7.53494 4.29289 7.92546C3.90237 8.31599 3.90237 8.94915 4.29289 9.33967L6.29289 11.3397C6.68342 11.7302 7.31658 11.7302 7.70711 11.3397L11.7071 7.33967Z"
      />
    </svg>
  );
}
