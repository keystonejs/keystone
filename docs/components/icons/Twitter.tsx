/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Grad } from './util';

export function Twitter({ grad, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 26 21"
      aria-label="KeystoneJS on Twitter"
      role="img"
      {...props}
    >
      <Grad name="Twitter" />
      <path
        fill={grad ? `url(#Twitter-${grad})` : 'currentColor'}
        d="M8.54 20.22c9.32 0 14.41-7.74 14.41-14.46l-.01-.66c.99-.71 1.84-1.6 2.53-2.62-.93.4-1.91.68-2.91.8A5.1 5.1 0 0024.78.45c-1 .6-2.08 1.01-3.21 1.24a5.07 5.07 0 00-8.64 4.63A14.35 14.35 0 012.5 1.03 5.1 5.1 0 004.06 7.8c-.8-.02-1.6-.24-2.3-.63v.06a5.1 5.1 0 004.06 4.98c-.74.2-1.52.24-2.28.1a5.09 5.09 0 004.73 3.52 10.15 10.15 0 01-7.5 2.1 14.32 14.32 0 007.77 2.28"
      />
    </svg>
  );
}
