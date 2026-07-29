import { Global } from '@emotion/react'

import { COLORS, SPACE, TYPE, TYPESCALE } from '../lib/TOKENS.ts'

export function Theme() {
  return (
    <Global
      styles={{
        '[data-theme="light"]': { ...COLORS['light'] },
        '[data-theme="dark"]': { ...COLORS['dark'] },
        ':root': {
          ...SPACE,
          ...TYPE,
          ...TYPESCALE,
          '--wrapper-width': '90rem',
        },
      }}
    />
  )
}
