
import { jsx } from '@emotion/react'

import { type IconProps } from './util'

export function WestpacLogo (props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      fill="none"
      role="img"
      aria-label="Westpac logo"
      {...props}
    >
      <circle cx="24" cy="24" r="24" fill="#ED1A3A" />
      <path
        fill="#fff"
        d="M6.076 16.709c.505.214.836 1.527.836 1.527l3.13 10.96c.361 1.372 1.503 2.095 2.781 2.095h6.864c-.492-.088-1.03-1.546-1.03-1.546l-3.481-10.903c-.501-1.665-1.346-2.133-2.625-2.133H6.076Zm29.05 0c-1.283 0-2.113.468-2.606 2.133l-3.5 10.903s-.533 1.458-1.03 1.546h6.864c1.284 0 2.415-.723 2.78-2.094l3.13-10.961s.342-1.313.856-1.527h-6.494Zm-15.089.078v14.504h7.642V16.787h-7.642Z"
      />
    </svg>
  )
}
