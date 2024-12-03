import React from 'react'

import { ComboboxMulti, Item } from '@keystar/ui/combobox'
import { css } from '@keystar/ui/style'

import { type ListMeta } from '../../../../types'
import { useApolloQuery } from './useApolloQuery'

export function ComboboxMany ({
  autoFocus,
  description,
  isDisabled,
  isLoading,
  isReadOnly,
  label,
  labelField,
  searchFields,
  list,
  placeholder,
  state,
  extraSelection = '',
}: {
  autoFocus?: boolean
  description?: string
  isDisabled?: boolean
  isLoading?: boolean
  isReadOnly?: boolean
  label?: string
  labelField: string
  searchFields: string[]
  list: ListMeta
  placeholder?: string
  state: {
    kind: 'many'
    value: { label: string; id: string }[]
    onChange(value: { label: string; id: string }[]): void
  }
  extraSelection?: string
}) {
  const { data, loadingState, error, onLoadMore, search, setSearch } =
    useApolloQuery({
      extraSelection,
      labelField,
      list,
      searchFields,
      state,
    })

  // TODO: better error UI
  // TODO: Handle permission errors
  // (ie; user has permission to read this relationship field, but
  // not the related list, or some items on the list)
  if (error) return <span>Error</span>

  // diff selection. only show items that are not selected
  const items = data?.items ?? []

  return (
    <ComboboxMulti
      autoFocus={autoFocus}
      description={description}
      isDisabled={isDisabled || isReadOnly}
      items={items}
      label={label}
      loadingState={loadingState}
      onInputChange={setSearch}
      inputValue={search}
      onLoadMore={onLoadMore}
      placeholder={placeholder}
      selectedKeys={state.value.map(item => item.id)}
      onSelectionChange={selection => {
        // TODO
        if (selection === 'all') return

        const selectedItems = uniqueById([...state.value, ...items]).filter(item => selection.has(item.id))
        state.onChange(selectedItems)
      }}
      minWidth="alias.singleLineWidth"
      width="auto"
      UNSAFE_className={css({
        // This should probably be addressed in @keystar/ui/combobox
        // - the mobile variant should respect the `width` prop
        '[role="button"]': { width: 'auto' },
      })}
    >
      {item => <Item>{item.label || item.id}</Item>}
    </ComboboxMulti>
  )
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  return Array.from(new Map(items.map(item => [item.id, item])).values())
}
