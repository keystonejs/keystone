'use client'

import { Well } from '../components/primitives/Well'

export function WellPreview (data) {
  return <Well {...data.value}>{data.children}</Well>
}
