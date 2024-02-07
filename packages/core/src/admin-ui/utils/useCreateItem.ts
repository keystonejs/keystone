import { useToasts } from '@keystone-ui/toast'
import { useMemo, useState, useRef, useCallback } from 'react'
import isDeepEqual from 'fast-deep-equal'
import { usePreventNavigation } from './usePreventNavigation'
import { useMutation, gql } from '../apollo'
import { type ListMeta } from '../../types'
import {
  type ControllerValue,
  type GraphQLValue,
  controllerToGraphQLValue,
  getDefaultControllerValue,
  useInvalidFields,
} from '@keystone-6/core/admin-ui/utils'

export function useCreateItem (list: ListMeta) {
  const toasts = useToasts()
  const [createItem, { loading: createLoading, error: createError, data: createData }] = useMutation<{ item: GraphQLValue }>(gql`
    mutation CreateItem ($data: ${list.gqlNames.createInputName}!) {
      item: ${list.gqlNames.createMutationName}(data: $data) {
        id
      }
    }
  `, {
    update: (cache, { data }) => {
      if (!data?.item?.id) return
      cache.evict({ id: cache.identify(data.item) })
    },
  })

  const defaultItemState = useMemo(() => getDefaultControllerValue(list.fields), [list.fields])
  const [itemState, setItemState] = useState(defaultItemState)
  const invalidFields = useInvalidFields(list.fields, itemState)
  const forceValidation = invalidFields.size !== 0
  const changed = !isDeepEqual(itemState, defaultItemState)

  const shouldPreventNavigationRef = useRef(changed)
  const onChange = useCallback((value: ControllerValue) => {
    shouldPreventNavigationRef.current = true
    setItemState(value)
  }, [setItemState])

  usePreventNavigation(shouldPreventNavigationRef)

  const label = list.isSingleton ? list.label : createData?.item?.[list.labelField]
  const loading = createLoading
  const error = createError
  return {
    loading,
    error,
    itemLabel: label,
    changed,
    fieldsProps: {
      groups: list.groups,
      fields: list.fields,
      forceValidation,
      invalidFields,
      onChange,
      value: itemState,
      mode: 'create' as const
    },
    async create () {
      if (forceValidation) return

      try {
        const { data: createData, errors: createErrors } = await createItem({
          variables: {
            data: controllerToGraphQLValue(list.fields, itemState)
          },
        })

        shouldPreventNavigationRef.current = false
        const error = createErrors?.find(x => x.path === undefined || x.path?.length === 1)
        if (error) {
          toasts.addToast({
            title: 'Failed to create item',
            tone: 'negative',
            message: error.message,
          })
        } else {
          toasts.addToast({
            title: 'Created successfully',
            tone: 'positive',
          })
        }
        return createData?.item

      } catch (e) {
        console.error(e)
      }
    },
    async reset () {
      setItemState(defaultItemState)
    },
  }
}
