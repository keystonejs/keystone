
import { jsx } from '@emotion/react'

import { Gradients, type IconProps } from './util'

export function YouTube ({ grad, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      aria-label="KeystoneJS on YouTube"
      role="img"
      {...props}
    >
      <Gradients name="Twitter" />
      <path
        fill={grad ? `url(#Twitter-${grad})` : 'currentColor'}
        d="M14.7 4.63a1.75 1.75 0 00-1.23-1.24C12.38 3.1 8 3.1 8 3.1s-4.38 0-5.47.3A1.75 1.75 0 001.3 4.62C1.1 5.74 1 6.87 1 8s.1 2.26.3 3.37a1.75 1.75 0 001.23 1.24c1.09.29 5.47.29 5.47.29s4.38 0 5.47-.3a1.75 1.75 0 001.23-1.23c.2-1.11.3-2.24.3-3.37s-.1-2.26-.3-3.37zM6.6 10.1V5.9L10.23 8 6.6 10.1z"
      />
    </svg>
  )
}
