import { ComboboxMulti, Item } from '@keystar/ui/combobox'
import { css } from '@keystar/ui/style'

import type { ListMeta } from '../../../../types'
import type { RelationshipValue } from './types'
import { useApolloQuery } from './useApolloQuery'
import { useState } from 'react'

export function ComboboxMany({
  extraSelection = '',
  forceValidation,
  isDisabled,
  isLoading,
  isReadOnly,
  isRequired,
  labelField,
  list,
  searchFields,
  state,
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
  'aria-label'?: string
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
  const { data, loadingState, error, onLoadMore, search, setSearch } = useApolloQuery({
    labelField,
    list,
    searchFields,
    state,
  })
  const [shouldShowErrors, setShouldShowErrors] = useState(false)
  const validationMessages =
    isRequired && state.value.length === 0 ? [`At least one ${list.singular} is required`] : []

  // TODO: better error UI
  // TODO: Handle permission errors
  // (ie; user has permission to read this relationship field, but
  // not the related list, or some items on the list)
  if (error) return <span>Error</span>

  const items: RelationshipValue[] = data?.items?.map(x => ({ ...x, built: false })) ?? []
  const fetchedIds = new Set(items.map(item => item.id))

  for (const item of state.value) {
    if (!fetchedIds.has(item.id)) {
      items.push(item)
    }
  }

  return (
    <ComboboxMulti
      {...props}
      isDisabled={isDisabled || isReadOnly}
      isRequired={isRequired}
      items={items}
      loadingState={loadingState}
      errorMessage={
        !!validationMessages.length && (shouldShowErrors || forceValidation)
          ? validationMessages.join('. ')
          : undefined
      }
      onBlur={() => {
        setShouldShowErrors(true)
      }}
      onInputChange={setSearch}
      inputValue={search}
      onLoadMore={onLoadMore}
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
