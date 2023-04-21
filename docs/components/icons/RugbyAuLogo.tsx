/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';

import { IconProps } from './util';

export function RugbyAuLogo(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      fill="none"
      role="img"
      aria-label="Rugby Australia logo"
      {...props}
    >
      <rect width="48" height="48" fill="#171772" rx="7.291" />
      <path
        fill="#fff"
        d="m28.292 39.079-4.894-9.759h-4.296v8.848a2.1 2.1 0 0 1-2.105 2.106H10.68V9.746a2.1 2.1 0 0 1 2.105-2.105h14.226c7.226 0 11.351 4.808 11.351 10.896 0 5.69-3.47 8.735-6.486 9.816l6.657 12.006h-8.336a2.375 2.375 0 0 1-1.906-1.28ZM29.8 18.452c0-2.19-1.85-3.47-4.04-3.47h-6.658v6.998h6.658c2.19 0 4.04-1.223 4.04-3.528Z"
      />
    </svg>
  );
}
