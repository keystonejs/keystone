import React from 'react'

import { Combobox, Item } from '@keystar/ui/combobox'
import { css } from '@keystar/ui/style'

import { type ListMeta } from '../../../../types'
import { type RelationshipValue } from './types'
import { useApolloQuery } from './useApolloQuery'

export function ComboboxSingle ({
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
    kind: 'one'
    value: RelationshipValue | null
    onChange(value: RelationshipValue | null): void
  }
}) {
  const { data, loading, error, onLoadMore, search, setSearch } =
    useApolloQuery({
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
    <Combobox
      autoFocus={autoFocus}
      description={description}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      items={data?.items ?? []}
      label={label}
      loadingState={loading || isLoading ? 'loading' : 'idle'}
      onInputChange={input => {
        setSearch(input)

        // unset the selected value when the user clears the input
        if (input === '') state.onChange(null)
      }}
      inputValue={search}
      onLoadMore={onLoadMore}
      placeholder={placeholder}
      selectedKey={state.value ? state.value.id.toString() : null}
      onSelectionChange={key => {
        const [selectedItem = null] = items.filter(item => key === item.id.toString())

        state.onChange(selectedItem)
        setSearch(selectedItem?.label ?? '')
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
    </Combobox>
  )
}
