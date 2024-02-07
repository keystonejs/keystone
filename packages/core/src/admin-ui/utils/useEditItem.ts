import { useToasts } from '@keystone-ui/toast'
import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import isDeepEqual from 'fast-deep-equal'
import { usePreventNavigation } from './usePreventNavigation'
import {
  useMutation,
  useQuery,
  gql
} from '../apollo'
import { type ListMeta } from '../../types'
import {
  type ControllerValue,
  type GraphQLValue,
  controllerToGraphQLValue,
  graphQLValueToController,
  useInvalidFields,
} from '@keystone-6/core/admin-ui/utils'

export function useEditItem (list: ListMeta, id: string) {
  const toasts = useToasts()
  const selectedFields = Object.entries(list.fields)
    .filter(([fieldKey, field]) => {
      if (fieldKey === 'id') return true
      return field.itemView.fieldMode !== 'hidden'
    })
    .map(([fieldKey]) => list.fields[fieldKey].controller.graphqlSelection)
    .join('\n')

  const { loading: getLoading, error: getError, data: getData } = useQuery<{ item: GraphQLValue | null }>(gql`
    query GetItem ($id: ID!) {
      item: ${list.gqlNames.itemQueryName}(where: { id: $id }) {
        ${selectedFields}
      }
    }
  `, {
    variables: { id }
  })

  const [updateItem, { loading: updateLoading, error: updateError }] = useMutation<{ item: GraphQLValue }>(gql`
    mutation UpdateItem ($id: ID!, $data: ${list.gqlNames.updateInputName}!) {
      item: ${list.gqlNames.updateMutationName}(where: { id: $id }, data: $data) {
        id
      }
    }
  `, {
    variables: { id },
    update: (cache, { data }) => {
      if (!data?.item?.id) return
      cache.evict({ id: cache.identify(data.item) })
    },
  })

  const [deleteItem, { loading: deleteLoading, error: deleteError }] = useMutation<{ item: GraphQLValue }>(gql`
    mutation DeleteItem ($id: ID!) {
      item: ${list.gqlNames.deleteMutationName}(where: { id: $id }) {
        id
      }
    }
  `, {
    variables: { id },
    update: (cache, { data }) => {
      if (!data?.item?.id) return
      cache.evict({ id: cache.identify(data.item) })
    },
  })

  const savedItemState = useMemo(() => {
    if (!getData?.item) return null
    return graphQLValueToController(list.fields, getData.item)
  }, [list.fields, getData?.item])
  const [itemState, setItemState] = useState(savedItemState)
  const invalidFields = useInvalidFields(list.fields, itemState)
  const forceValidation = invalidFields.size !== 0
  const changed = !isDeepEqual(itemState, savedItemState)
  useEffect(() => {
    if (!savedItemState) return
    setItemState(savedItemState)
  }, [savedItemState === null])

//    useEffect(() => {
//      setItemState(savedItemState)
//    }, [savedItemState?.id])

  const shouldPreventNavigationRef = useRef(changed)
  const onChange = useCallback((value: ControllerValue) => {
    shouldPreventNavigationRef.current = true
    setItemState(value)
  }, [setItemState])

  usePreventNavigation(shouldPreventNavigationRef)

  const labelField = getData?.item?.[list.labelField]
  const label = list.isSingleton ? list.label : (typeof labelField === 'string' ? labelField : id)
  const loading = getLoading || updateLoading || deleteLoading
  const error = getError ?? updateError ?? deleteError

  if (itemState === null) return { ready: false as const } as const
  return {
    ready: true as const,
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
      mode: 'item' as const
    },
    async update () {
      if (forceValidation) return
      if (!itemState) return

      try {
        const { data: updateData, errors: updateErrors } = await updateItem({
          variables: {
            id,
            data: controllerToGraphQLValue(list.fields, itemState)
          },
        })

        shouldPreventNavigationRef.current = false
        const error = updateErrors?.find(x => x.path === undefined || x.path?.length === 1)
        if (error) {
          toasts.addToast({
            title: 'Failed to update item',
            tone: 'negative',
            message: error.message,
          })
        } else {
          toasts.addToast({
            title: 'Saved successfully',
            tone: 'positive',
          })
        }
        return updateData?.item

      } catch (e) {
        console.error(e)
      }
    },
    async delete () {
      try {
        const { data: deleteData } = await deleteItem()
        toasts.addToast({
          title: `Delete ${label}`,
          message: `Deleted ${list.singular} item successfully`,
          tone: 'positive',
        })

        return deleteData?.item
      } catch (err: any) {
        toasts.addToast({
          title: `Failed to delete ${list.singular} item: ${label}`,
          message: err.message,
          tone: 'negative',
        })
        return
      }
    },
    async reset () {
      setItemState(savedItemState)
    },
  }
}
