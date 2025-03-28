import { useState } from 'react'

import { Combobox, Item } from '@keystar/ui/combobox'
import { css } from '@keystar/ui/style'

import type { ListMeta } from '../../../../types'
import type { RelationshipValue } from './types'
import { useApolloQuery } from './useApolloQuery'

export function ComboboxSingle({
  labelField,
  searchFields,
  list,
  state,
  isLoading,
  ...props
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
  const { data, loading, error, onLoadMore, search, setSearch } = useApolloQuery({
    labelField,
    list,
    searchFields,
    state,
  })

  const [lastSeenStateValue, setLastSeenStateValue] = useState(state.value)

  if (state.value !== lastSeenStateValue) {
    setLastSeenStateValue(state.value)
    setSearch(state.value?.label ?? '')
  }

  // TODO: better error UI
  // TODO: Handle permission errors
  // (ie; user has permission to read this relationship field, but
  // not the related list, or some items on the list)
  if (error) return <span>Error</span>

  const items: RelationshipValue[] = data?.items?.map(x => ({ ...x, built: false })) ?? []

  if (
    state.value !== null &&
    (state.value.built || !items.some(item => item.id === state.value?.id))
  ) {
    items.push(state.value)
  }

  return (
    <Combobox
      {...props}
      items={data?.items ?? []}
      loadingState={loading || isLoading ? 'loading' : 'idle'}
      onInputChange={input => {
        setSearch(input)

        // unset the selected value when the user clears the input
        if (input === '') state.onChange(null)
      }}
      inputValue={search}
      onLoadMore={onLoadMore}
      selectedKey={state.value ? state.value.id.toString() : null}
      onSelectionChange={key => {
        const selectedItem = items.find(item => item.id.toString() === key) ?? null
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
