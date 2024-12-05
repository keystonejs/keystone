import React from 'react'

import { ComboboxMulti, Item } from '@keystar/ui/combobox'
import { css } from '@keystar/ui/style'

import { type ListMeta } from '../../../../types'
import { type RelationshipValue } from './types'
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
    value: RelationshipValue[]
    onChange(value: RelationshipValue[]): void
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
      selectedKeys={state.value?.map(item => item.id.toString())}
      onSelectionChange={selection => {
        // TODO
        if (selection === 'all') return

        const selectedItems = items.filter(item => selection.has(item.id.toString()))
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
