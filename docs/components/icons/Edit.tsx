/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Grad } from './util';

export function Edit({ grad, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
      aria-label="Copy"
      role="img"
      fill="none"
      {...props}
    >
      <Grad name="Edit" />
      <path
        fill={grad ? `url(#Edit-${grad})` : 'currentColor'}
        d="M8.86865 0.868623C9.49349 0.243784 10.5066 0.243784 11.1314 0.868623C11.7562 1.49346 11.7562 2.50653 11.1314 3.13136L10.4971 3.76568L8.23434 1.50294L8.86865 0.868623Z"
      />
      <path
        fill={grad ? `url(#Edit-${grad})` : 'currentColor'}
        d="M7.10297 2.63431L0.400024 9.33725V11.6H2.66276L9.36571 4.89705L7.10297 2.63431Z"
      />
    </svg>
  );
}
