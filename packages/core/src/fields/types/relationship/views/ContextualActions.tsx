import { type Key, type PropsWithChildren, useMemo } from 'react'

import { Icon } from '@keystar/ui/icon'
import { arrowUpRightIcon } from '@keystar/ui/icon/icons/arrowUpRightIcon'
import { plusIcon } from '@keystar/ui/icon/icons/plusIcon'
import { Grid } from '@keystar/ui/layout'
import { ActionMenu, Item } from '@keystar/ui/menu'
import { Text } from '@keystar/ui/typography'

import { useKeystone, useList } from '../../../../admin-ui/context'
import type { FieldProps, ListMeta } from '../../../../types'
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
  const relatedItemHref = useRelatedItemHref(props)
  const relatedItemLabel = useRelatedItemLabel(field)
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

    result.push({
      key: 'view',
      icon: arrowUpRightIcon,
      href: relatedItemHref,
      label: relatedItemLabel,
    })

    return result
  }, [allowAdd, foreignList, relatedItemHref, relatedItemLabel])

  const onAction = (key: Key) => {
    switch (key) {
      case 'add': {
        onAdd()
        break
      }
    }
  }

  // we don't want to change the presence or lack thereof of a selected value
  // but since `allowAdd` is based on config, it's fairly static and showing
  // a menu when the menu will only have one item is quite silly
  if (!allowAdd) {
    return (
      <TooltipTrigger>
        <ActionButton {...(relatedItemHref ? { href: relatedItemHref } : { isDisabled: true })}>
          <Icon src={arrowUpRightIcon} />
        </ActionButton>
        <Tooltip>{relatedItemLabel}</Tooltip>
      </TooltipTrigger>
    )
  }

  return (
    <ActionMenu
      aria-label={`Actions for ${field.label}`}
      direction="bottom"
      align="end"
      isDisabled={items.length === 0}
      disabledKeys={relatedItemHref === null ? ['view'] : []}
      items={items}
      onAction={onAction}
    >
      {item => (
        <Item key={item.key} href={item.href ?? undefined} textValue={item.label}>
          <Icon src={item.icon} />
          <Text>{item.label}</Text>
        </Item>
      )}
    </ActionMenu>
  )
}

export function useRelatedItemLabel(field: RelationshipController) {
  const foreignList = useList(field.refListKey)
  if (field.many) {
    return `View related ${foreignList.plural.toLocaleLowerCase()}`
  }
  return `View ${foreignList.singular.toLocaleLowerCase()}`
}

export function useRelatedItemHref({
  field,
  value,
}: Pick<FieldProps<() => RelationshipController>, 'field' | 'value'>) {
  const foreignList = useList(field.refListKey)
  const { adminPath } = useKeystone()
  if (value.kind === 'one') {
    if (!value.value) return null
    // the related item isn't actually created yet so we can't view it
    if (value.value.built) return null

    return `${adminPath}/${foreignList.path}/${value.value.id}`
  }
  let query: string | undefined
  if (field.refFieldKey && value.id !== null) {
    query = buildQueryForRelationshipFieldWithForeignField(foreignList, field.refFieldKey, value.id)
  } else if (value.kind === 'many' && value.value.length > 0) {
    query = `!id_in=${JSON.stringify(value.value.map(x => x.id))}`
  }
  if (query === undefined) return null

  return `${adminPath}/${foreignList.path}?${query}`
}

export function buildQueryForRelationshipFieldWithForeignField(
  foreignList: ListMeta,
  refFieldKey: string,
  localId: string
) {
  const foreignField = foreignList.fields[refFieldKey]
  const foreignMany: boolean = (foreignField.fieldMeta as any).many
  return `filter=${refFieldKey}_${foreignMany ? 'some' : 'is'}_${JSON.stringify(foreignMany ? [localId] : localId)}`
}
