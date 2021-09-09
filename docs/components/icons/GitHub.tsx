/** @jsx jsx */
import { jsx } from '@emotion/react';

import { Gradients, IconProps } from './util';

export function GitHub({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 23 22"
      aria-label="KeystoneJS on GitHub"
      role="img"
      {...props}
    >
      <Gradients name="GitHub" />
      <path
        fill={grad ? `url(#GitHub-${grad})` : 'currentColor'}
        d="M11.8.45a10.98 10.98 0 00-3.47 21.4c.55.1.72-.25.72-.54v-2.04c-3.05.66-3.68-1.3-3.68-1.3-.5-1.26-1.22-1.6-1.22-1.6-1-.68.07-.67.07-.67 1.1.08 1.68 1.13 1.68 1.13.98 1.68 2.57 1.2 3.2.92.1-.71.38-1.2.7-1.47-2.44-.28-5-1.22-5-5.43 0-1.2.42-2.17 1.12-2.94-.1-.28-.48-1.4.11-2.9 0 0 .92-.3 3.02 1.12a10.53 10.53 0 015.5 0C16.65 4.7 17.56 5 17.56 5c.6 1.52.22 2.63.11 2.9.7.78 1.13 1.76 1.13 2.95 0 4.22-2.57 5.15-5.01 5.42.4.34.75 1 .75 2.03v3.01c0 .3.18.64.73.53A10.98 10.98 0 0011.8.45z"
      />
    </svg>
  );
}
