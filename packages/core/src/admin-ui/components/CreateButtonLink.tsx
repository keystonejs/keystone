import React from 'react'
import { Button } from '@keystar/ui/button'
import { Text } from '@keystar/ui/typography'

import type { ListMeta } from '../../types'

export function CreateButtonLink (props: { children?: string, list: ListMeta }) {
  const { list, children = `Create ${list.singular}` } = props
  return (
    <Button
      aria-label={`New ${props.list.singular}`}
      href={`/${list.path}/create`}
      prominence='high'
    >
      <Text>{children}</Text>
    </Button>
  )
}
