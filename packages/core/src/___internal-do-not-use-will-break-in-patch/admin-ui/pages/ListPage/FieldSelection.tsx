import React, {
  type Key,
  useMemo,
} from 'react'
import { useRouter } from 'next/router'
import isDeepEqual from 'fast-deep-equal'

import { ActionButton } from '@keystar/ui/button'
import { Icon } from '@keystar/ui/icon'
import { chevronDownIcon } from '@keystar/ui/icon/icons/chevronDownIcon'
import { MenuTrigger, Menu, Item } from '@keystar/ui/menu'
import { Text } from '@keystar/ui/typography'

import { useList } from '../../../../admin-ui/context'
import { useSelectedFields } from './useSelectedFields'

export function FieldSelection ({
  listKey,
  isDisabled,
}: {
  listKey: string
  isDisabled?: boolean
}) {
  const router = useRouter()
  const list = useList(listKey)
  const selectedFields = useSelectedFields(list)

  const setNewSelectedFields = (selectedFields: Key[]) => {
    // Clear the `fields` query param when selection matches initial columns
    if (isDeepEqual(selectedFields, list.initialColumns)) {
      const { fields: _ignore, ...otherQueryFields } = router.query
      router.push({ query: otherQueryFields })
    } else {
      router.push({ query: { ...router.query, fields: selectedFields.join(',') } })
    }
  }

  const fields = useMemo(() => {
    return Object.values(list.fields)
      .filter(field => field.listView.fieldMode === 'read')
      .map(field => ({
        value: field.path,
        label: field.label,
        isDisabled: selectedFields.size === 1 && selectedFields.has(field.path),
      }))
  }, [list.fields, selectedFields])

  return (
    <MenuTrigger>
      <ActionButton isDisabled={isDisabled}>
        <Text>Columns</Text>
        <Icon src={chevronDownIcon} />
      </ActionButton>
      <Menu
        items={fields}
        disallowEmptySelection
        onSelectionChange={selection => {
          if (selection === 'all') {
            setNewSelectedFields(fields.map(field => field.value))
          } else {
            setNewSelectedFields(Array.from(selection))
          }
        }}
        selectionMode="multiple"
        selectedKeys={selectedFields}
      >
        {item => (
          <Item key={item.value} >{item.label}</Item>
        )}
      </Menu>
    </MenuTrigger>
  )
}
