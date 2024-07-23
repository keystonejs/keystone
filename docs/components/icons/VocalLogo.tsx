
import { jsx } from '@emotion/react'

import { type IconProps } from './util'

export function VocalLogo (props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      fill="none"
      role="img"
      aria-label="Vocal logo"
      {...props}
    >
      <circle cx="24" cy="24" r="24" fill="#fff" />
      <path
        fill="#181818"
        fillRule="evenodd"
        d="M24 43c10.493 0 19-8.507 19-19S34.493 5 24 5 5 13.507 5 24s8.507 19 19 19Zm0 1c11.046 0 20-8.954 20-20S35.046 4 24 4 4 12.954 4 24s8.954 20 20 20Z"
        clipRule="evenodd"
      />
      <path
        fill="#181818"
        fillRule="evenodd"
        d="M33 18.5a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-1 0v-9a.5.5 0 0 1 .5-.5ZM28.5 21a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-1 0v-9a.5.5 0 0 1 .5-.5ZM24 23a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-1 0v-9a.5.5 0 0 1 .5-.5ZM19.5 21a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-1 0v-9a.5.5 0 0 1 .5-.5ZM15 18.5a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-1 0v-9a.5.5 0 0 1 .5-.5Z"
        clipRule="evenodd"
      />
    </svg>
  )
}
