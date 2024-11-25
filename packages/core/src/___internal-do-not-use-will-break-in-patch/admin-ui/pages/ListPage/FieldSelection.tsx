import React, {
  type Key,
  useMemo,
} from 'react'
import { useRouter } from 'next/router'

import { ActionButton } from '@keystar/ui/button'
import { Icon } from '@keystar/ui/icon'
import { chevronDownIcon } from '@keystar/ui/icon/icons/chevronDownIcon'
import { MenuTrigger, Menu, Item } from '@keystar/ui/menu'
import { Text } from '@keystar/ui/typography'

import type { ListMeta } from '../../../../types'
import { useSelectedFields } from './useSelectedFields'

export function FieldSelection ({
  fieldModesByFieldPath,
  isDisabled,
  list,
}: {
  fieldModesByFieldPath: Record<string, 'hidden' | 'read'>
  isDisabled?: boolean
  list: ListMeta
}) {
  const router = useRouter()
  const selectedFields = useSelectedFields(list, fieldModesByFieldPath)

  const setNewSelectedFields = (selectedFields: Key[]) => {
    // Clear the `fields` query param when selection matches initial columns
    if (isArrayEqual(selectedFields, list.initialColumns)) {
      const { fields: _ignore, ...otherQueryFields } = router.query
      router.push({ query: otherQueryFields })
    } else {
      router.push({ query: { ...router.query, fields: selectedFields.join(',') } })
    }
  }

  const fields = useMemo(() => {
    return Object.keys(fieldModesByFieldPath)
      .filter(fieldPath => fieldModesByFieldPath[fieldPath] === 'read')
      .map(fieldPath => ({
        value: fieldPath,
        label: list.fields[fieldPath].label,
        isDisabled: selectedFields.size === 1 && selectedFields.has(fieldPath),
      }))
  }, [fieldModesByFieldPath, list.fields, selectedFields])

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

function isArrayEqual (arrA: Key[], arrB: Key[]) {
  if (arrA.length !== arrB.length) return false
  for (let i = 0; i < arrA.length; i++) {
    if (arrA[i] !== arrB[i]) {
      return false
    }
  }
  return true
}
