import React, { type Key, type PropsWithChildren, useMemo } from 'react'

import { Icon } from '@keystar/ui/icon'
import { arrowUpRightIcon } from '@keystar/ui/icon/icons/arrowUpRightIcon'
import { plusIcon } from '@keystar/ui/icon/icons/plusIcon'
import { Grid } from '@keystar/ui/layout'
import { ActionMenu, Item } from '@keystar/ui/menu'
import { Text } from '@keystar/ui/typography'

import { useList } from '../../../../admin-ui/context'
import type { FieldProps } from '../../../../types'
import type { RelationshipController } from './types'

type RelationshipProps = {
  onAdd: () => void
} & FieldProps<() => RelationshipController>

export function ContextualActions(props: PropsWithChildren<RelationshipProps>) {
  const { children, ...otherProps } = props
  return (
    <Grid gap="regular" alignItems="end" columns="minmax(0, 1fr) auto">
      {children}
      <ContextualActionsMenu {...otherProps} />
    </Grid>
  )
}

function ContextualActionsMenu(props: RelationshipProps) {
  const { environment, field, onAdd, onChange, value } = props

  const foreignList = useList(field.refListKey)
  const relatedItem = useRelatedItem(props)

  const items = useMemo(() => {
    let result = []
    let allowCreate =
      !field.hideCreate &&
      onChange !== undefined &&
      environment !== 'create-dialog'

    if (allowCreate) {
      result.push({
        icon: plusIcon,
        key: 'add',
        label: `Add ${foreignList.singular.toLocaleLowerCase()}`,
      })
    }
    if (relatedItem) {
      result.push({
        key: 'view',
        ...relatedItem,
      })
    }

    return result
  }, [value])

  const onAction = (key: Key) => {
    switch (key) {
      case 'add': {
        onAdd()
        break
      }
    }
  }

  return (
    <ActionMenu
      aria-label={`Actions for ${field.label}`}
      direction="bottom"
      align="end"
      isDisabled={items.length === 0}
      items={items}
      onAction={onAction}
    >
      {item => (
        <Item
          key={item.key}
          href={'href' in item ? item.href : undefined}
          textValue={item.label}
        >
          <Icon src={item.icon} />
          <Text>{item.label}</Text>
        </Item>
      )}
    </ActionMenu>
  )
}

function useRelatedItem({
  field,
  value,
}: FieldProps<() => RelationshipController>) {
  const foreignList = useList(field.refListKey)

  switch (value.kind) {
    case 'count': {
      if (!value.count) {
        return null
      }

      // TODO: handle count if possible
      return null
    }
    case 'many': {
      if (!value.value.length) {
        return null
      }

      const query =
        field.refFieldKey && value.id
          ? `!${field.refFieldKey}_matches="${value.id}"`
          : `!id_in="${value.value
              .slice(0, 100) // where does 100 come from?
              .map(item => item.id)
              .join(',')}"`

      return {
        href: `/${foreignList.path}?${query}`,
        icon: arrowUpRightIcon,
        label: `View related ${foreignList.plural.toLocaleLowerCase()}`,
      }
    }
    case 'one': {
      if (!value.value) {
        return null
      }

      return {
        href: `/${foreignList.path}/${value.value.id}`,
        icon: arrowUpRightIcon,
        label: `View ${foreignList.singular.toLocaleLowerCase()}`,
      }
    }
    default: {
      const exhaustiveCheck: never = value['kind']
      throw new Error(`Unhandled value kind: "${exhaustiveCheck}".`)
    }
  }
}
