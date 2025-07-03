import { Button } from '@keystar/ui/button'
import { Text } from '@keystar/ui/typography'

import type { ListMeta } from '../../types'
import { useKeystone } from '../context'

export function CreateButtonLink(props: { children?: string; list: ListMeta }) {
  const { list, children = `Create ${list.singular}` } = props
  const { adminPath } = useKeystone()
  return (
    <Button
      aria-label={`New ${props.list.singular}`}
      href={`${adminPath}/${list.path}/create`}
      prominence="high"
    >
      <Text>{children}</Text>
    </Button>
  )
}
