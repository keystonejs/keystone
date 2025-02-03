import React, {
  type ReactNode,
} from 'react'
import { Cell } from '@keystar/ui/table'

export function CellContainer ({ children, ...props }: { children: ReactNode }) {
  return (
    <Cell {...props}>
      {children}
    </Cell>
  )
}
