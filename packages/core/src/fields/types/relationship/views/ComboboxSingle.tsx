import React, { useEffect } from 'react'

import { Combobox, Item } from '@keystar/ui/combobox'
import { css } from '@keystar/ui/style'

import { type ListMeta } from '../../../../types'
import { useApolloQuery } from './useApolloQuery'

export const ComboboxSingle = ({
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
    kind: 'one'
    value: { label: string; id: string; data?: Record<string, any> } | null
    onChange(
      value: { label: string; id: string; data: Record<string, any> } | null
    ): void
  }
  extraSelection?: string
}) => {
  const { data, loading, error, onLoadMore, search, setSearch } =
    useApolloQuery({
      extraSelection,
      labelField,
      list,
      searchFields,
      state,
    })

  useEffect(() => {}, [])

  // TODO: better error UI
  // TODO: Handle permission errors
  // (ie; user has permission to read this relationship field, but
  // not the related list, or some items on the list)
  if (error) {
    return <span>Error</span>
  }

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
        // NOTE: remove when we support required relationships
        if (input === '') {
          state.onChange(null)
        }
      }}
      inputValue={search}
      onLoadMore={onLoadMore}
      placeholder={placeholder}
      selectedKey={state.value ? state.value.id : null}
      onSelectionChange={key => {
        const item = key ? data?.items.find(item => item.id === key) : null
        state.onChange(
          item
            ? {
                id: item.id,
                label: item.label ?? item.id,
                data: item,
              }
            : null
        )
        setSearch(item?.label ?? '')
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
