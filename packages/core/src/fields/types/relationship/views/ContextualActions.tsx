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
import { ActionButton } from '@keystar/ui/button'
import { Tooltip, TooltipTrigger } from '@keystar/ui/tooltip'

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
  const { field, onAdd, onChange } = props

  const foreignList = useList(field.refListKey)
  const relatedItem = useRelatedItem(props)
  const allowAdd = !field.hideCreate && !!onChange
  const items = useMemo(() => {
    const result = []
    if (allowAdd) {
      result.push({
        icon: plusIcon,
        key: 'add',
        label: `Add ${foreignList.singular.toLocaleLowerCase()}`,
      })
    }

    if (relatedItem) {
      result.push({
        key: 'view',
        icon: arrowUpRightIcon,
        ...relatedItem,
      })
    }

    return result
  }, [allowAdd, foreignList, relatedItem])

  const onAction = (key: Key) => {
    switch (key) {
      case 'add': {
        onAdd()
        break
      }
    }
  }

  if (items.length === 0) return null

  if (items.length === 1) {
    const item = items[0]
    return (
      <TooltipTrigger>
        <ActionButton
          key={item.key}
          {...('href' in item && item.href
            ? { href: item.href }
            : { onPress: () => onAction(item.key) })}
        >
          <Icon src={item.icon} />
        </ActionButton>
        <Tooltip>{item.label}</Tooltip>
      </TooltipTrigger>
    )
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
        <Item key={item.key} href={'href' in item ? item.href : undefined} textValue={item.label}>
          <Icon src={item.icon} />
          <Text>{item.label}</Text>
        </Item>
      )}
    </ActionMenu>
  )
}

function useRelatedItem({ field, value }: FieldProps<() => RelationshipController>) {
  const foreignList = useList(field.refListKey)
  return useMemo((): {
    href: string
    label: string
  } | null => {
    if (value.kind === 'one') {
      if (!value.value) return null
      // the related item isn't actually created yet so we can't view it
      if (value.value.built) return null

      return {
        href: `/${foreignList.path}/${value.value.id}`,
        label: `View ${foreignList.singular.toLocaleLowerCase()}`,
      }
    }
    let query: string | undefined
    if (field.refFieldKey) {
      const foreignField = foreignList.fields[field.refFieldKey]
      query = `!${field.refFieldKey}_${(foreignField.fieldMeta as any).many ? 'some' : 'is'}=${value.id}`
    } else if (value.kind === 'many' && value.value.length > 0) {
      query = `!id_in=${JSON.stringify(value.value.map(x => x.id))}`
    }
    if (query === undefined) return null

    return {
      href: `/${foreignList.path}?${query}`,
      label: `View related ${foreignList.plural.toLocaleLowerCase()}`,
    }
  }, [field.refFieldKey, foreignList, value])
}
