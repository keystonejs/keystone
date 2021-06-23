/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function Editor({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      aria-label="Editor"
      role="img"
      fill="none"
      {...props}
    >
      <Gradients name="Editor" />
      <path
        stroke={grad ? `url(#Editor-${grad})` : 'currentColor'}
        transform="translate(1 1)"
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="M12.3 3.9H4A3.3 3.3 0 00.7 7.2v18.4c0 1.8 1.5 3.3 3.3 3.3h18.3c1.9 0 3.4-1.5 3.4-3.3v-8.4M23.3 1.5A3.3 3.3 0 1128 6.3L13.7 20.6H9v-4.7L23.3 1.5z"
      />
    </svg>
  );
}
