import { useState } from 'react'

import { Combobox, ComboboxItem } from '@keystar/ui/combobox'
import { css } from '@keystar/ui/style'

import type { ListMeta, ListSortDescriptor } from '../../../../types/index.ts'
import type { RelationshipValue } from './types.ts'
import { useApolloQuery } from './useApolloQuery.ts'

export function ComboboxSingle({
  forceValidation,
  isLoading,
  isRequired,
  labelField,
  list,
  searchFields,
  state,
  filter,
  sort,
  ...props
}: {
  autoFocus?: boolean
  description?: string
  forceValidation?: boolean
  isDisabled?: boolean
  isLoading?: boolean
  isReadOnly?: boolean
  isRequired?: boolean
  label?: string
  labelField: string
  searchFields: string[]
  list: ListMeta
  placeholder?: string
  filter?: Record<string, any> | null
  sort?: ListSortDescriptor<string> | null
  state: {
    kind: 'one'
    value: RelationshipValue | null
    onChange(value: RelationshipValue | null): void
  }
}) {
  const { data, error, search, setSearch } = useApolloQuery({
    labelField,
    list,
    searchFields,
    state,
    filter,
    sort,
  })

  const [shouldShowErrors, setShouldShowErrors] = useState(false)
  const validationMessages =
    isRequired && state.value === null ? [`A ${list.singular} is required`] : []
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
      isRequired={isRequired}
      items={items}
      errorMessage={
        !!validationMessages.length && (shouldShowErrors || forceValidation)
          ? validationMessages.join('. ')
          : undefined
      }
      onBlur={() => {
        setShouldShowErrors(true)
      }}
      onInputChange={input => {
        setSearch(input)

        // unset the selected value when the user clears the input
        if (input === '') state.onChange(null)
      }}
      inputValue={search}
      value={state.value ? state.value.id.toString() : null}
      onChange={key => {
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
      {item => <ComboboxItem key={item.id}>{item.label || item.id}</ComboboxItem>}
    </Combobox>
  )
}
