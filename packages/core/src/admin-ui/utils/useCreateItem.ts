import { useRouter } from 'next/router'
import { type ComponentProps, useEffect, useMemo, useRef, useState } from 'react'

import { toastQueue } from '@keystar/ui/toast'

import type { Fields } from '.'
import {
  makeDefaultValueState,
  serializeValueToOperationItem,
  useHasChanges,
  useInvalidFields,
} from '../../admin-ui/utils'
import type { ListMeta } from '../../types'
import { type ErrorLike, gql, type TypedDocumentNode, useMutation } from '../apollo'
import { usePreventNavigation } from './usePreventNavigation'

type CreateItemHookResult = {
  state: 'editing' | 'loading' | 'created'
  shouldPreventNavigation: boolean
  error?: ErrorLike
  props: ComponentProps<typeof Fields>
  create: () => Promise<{ id: string; label: string | null } | undefined>
}

export function useCreateItem(list: ListMeta): CreateItemHookResult {
  const router = useRouter()
  const [tryCreateItem, { loading, error, data: returnedData }] = useMutation(
    gql`mutation($data: ${list.graphql.names.createInputName}!) {
      item: ${list.graphql.names.createMutationName}(data: $data) {
        id
        label: ${list.labelField}
      }
    }` as TypedDocumentNode<
      { item: { id: string; label: string | null } },
      { data: Record<string, unknown> }
    >
  )

  const isRequireds = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(list.fields).map(([key, field]) => [key, field.createView.isRequired])
      ),
    [list.fields]
  )

  const [forceValidation, setForceValidation] = useState(false)
  const [value, setValue] = useState(() => makeDefaultValueState(list.fields))
  const invalidFields = useInvalidFields(list.fields, value, isRequireds)

  const hasChangedFields = useHasChanges(
    'create',
    list.fields,
    value,
    makeDefaultValueState(list.fields)
  )
  const shouldPreventNavigation = !returnedData?.item && hasChangedFields
  const shouldPreventNavigationRef = useRef(shouldPreventNavigation)

  useEffect(() => {
    shouldPreventNavigationRef.current = shouldPreventNavigation
  }, [shouldPreventNavigation])
  usePreventNavigation(shouldPreventNavigationRef)

  return {
    state: loading ? 'loading' : !returnedData?.item ? 'created' : 'editing',
    shouldPreventNavigation,
    error,
    props: {
      view: 'createView',
      position: 'form',
      fields: list.fields,
      groups: list.groups,
      forceValidation,
      invalidFields,
      value,
      isRequireds,
      onChange: newItemValue => setValue(newItemValue),
    },
    async create(): Promise<{ id: string; label: string | null } | undefined> {
      const newForceValidation = invalidFields.size !== 0
      setForceValidation(newForceValidation)

      if (newForceValidation) return

      let outputData: { item: { id: string; label: string | null } }
      try {
        outputData = await tryCreateItem({
          variables: {
            data: serializeValueToOperationItem('create', list.fields, value),
          },
          update(cache, { data }) {
            if (typeof data?.item?.id === 'string') {
              cache.evict({
                id: 'ROOT_QUERY',
                fieldName: `${list.graphql.names.itemQueryName}(${JSON.stringify({
                  where: { id: data.item.id },
                })})`,
              })
            }
          },
        }).then(x => {
          if (x.data) return x.data
          if (x.error) throw x.error
          throw new Error('Something went wrong during item creation.')
        })
      } catch {
        toastQueue.critical(`Unable to create ${list.singular.toLocaleLowerCase()}`)
        return
      }

      shouldPreventNavigationRef.current = false
      toastQueue.positive(`${list.singular} created`, {
        timeout: 5000,
        actionLabel: 'Create another',
        onAction: () => {
          router.push(`/${list.path}/create`)
        },
        shouldCloseOnAction: true,
      })

      return outputData.item
    },
  }
}

type BuildItemHookResult = {
  state: 'editing'
  error?: ErrorLike
  props: ComponentProps<typeof Fields>
  build: () => Promise<Record<string, unknown> | undefined>
}

export function useBuildItem(list: ListMeta, fieldKeys: string[] = []): BuildItemHookResult {
  const [forceValidation, setForceValidation] = useState(false)
  const [value, setValue] = useState(() => makeDefaultValueState(list.fields))
  const fields = fieldKeys.length
    ? Object.fromEntries(Object.entries(list.fields).filter(([key]) => fieldKeys.includes(key)))
    : list.fields

  const isRequireds = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(list.fields).map(([key, field]) => [key, field.createView.isRequired])
      ),
    [list.fields]
  )

  const invalidFields = useInvalidFields(list.fields, value, isRequireds)

  return {
    state: 'editing',
    props: {
      view: 'createView',
      position: 'form',
      fields,
      groups: list.groups,
      forceValidation,
      invalidFields,
      value,
      isRequireds,
      onChange: newItemValue => setValue(newItemValue),
    },
    async build() {
      const newForceValidation = invalidFields.size !== 0
      setForceValidation(newForceValidation)
      if (newForceValidation) return
      return serializeValueToOperationItem('create', list.fields, value)
    },
  }
}
