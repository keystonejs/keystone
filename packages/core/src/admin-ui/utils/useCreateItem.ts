import isDeepEqual from 'fast-deep-equal'
import { useRouter } from 'next/router'
import {
  type ComponentProps,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { toastQueue } from '@keystar/ui/toast'

import type { ListMeta } from '../../types'
import {
  type ApolloError,
  gql,
  useMutation
} from '../apollo'
import { usePreventNavigation } from './usePreventNavigation'
import type { Fields } from '.'

type CreateItemHookResult = {
  state: 'editing' | 'loading' | 'created'
  shouldPreventNavigation: boolean
  error?: ApolloError
  props: ComponentProps<typeof Fields>
  create: () => Promise<{ id: string, label: string | null } | undefined>
}

export function useCreateItem (list: ListMeta): CreateItemHookResult {
  const router = useRouter()
  const [tryCreateItem, { loading, error, data: returnedData }] = useMutation(
    gql`mutation($data: ${list.graphql.names.createInputName}!) {
      item: ${list.graphql.names.createMutationName}(data: $data) {
        id
        label: ${list.labelField}
      }
    }`
  )

  const [forceValidation, setForceValidation] = useState(false)
  const [value, setValue] = useState(() => {
    const value: Record<string, unknown> = {}
    for (const fieldPath in list.fields) {
      value[fieldPath] = list.fields[fieldPath].controller.defaultValue
    }
    return value
  })

  const invalidFields = useMemo(() => {
    const invalidFields = new Set<string>()

    for (const fieldPath in value) {
      const { controller } = list.fields[fieldPath]
      const fieldValue = value[fieldPath]

      const validateFn = controller.validate
      if (!validateFn) continue

      const valid = validateFn(fieldValue)
      if (valid) continue
      invalidFields.add(fieldPath)
    }

    return invalidFields
  }, [list, value])

  const data: Record<string, any> = {}
  for (const fieldPath in list.fields) {
    const { controller } = list.fields[fieldPath]
    const fieldValue = value[fieldPath]

    const serialized = controller.serialize(fieldValue)
    if (isDeepEqual(serialized, controller.serialize(controller.defaultValue))) continue

    Object.assign(data, serialized)
  }

  const shouldPreventNavigation = !returnedData?.item && Object.keys(data).length !== 0
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
      fields: list.fields,
      groups: list.groups,
      forceValidation,
      invalidFields,
      value,
      onChange: (newItemValue) => setValue(newItemValue)
    },
    async create (): Promise<{ id: string, label: string | null } | undefined> {
      const newForceValidation = invalidFields.size !== 0
      setForceValidation(newForceValidation)

      if (newForceValidation) return undefined

      let outputData: { item: { id: string, label: string | null } }
      try {
        outputData = await tryCreateItem({
          variables: { data },
          update (cache, { data }) {
            if (typeof data?.item?.id === 'string') {
              cache.evict({
                id: 'ROOT_QUERY',
                fieldName: `${list.graphql.names.itemQueryName}(${JSON.stringify({
                  where: { id: data.item.id },
                })})`,
              })
            }
          },
        }).then(x => x.data)
      } catch {
        // TODO: what about `error` returned from the mutation? do we need
        // to handle that too, should they be combined? does this code path
        // even happen?
        toastQueue.critical(`Unable to create ${list.singular.toLocaleLowerCase()}`)
        return undefined
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
  error?: ApolloError
  props: ComponentProps<typeof Fields>
  build: () => Promise<Record<string, unknown> | undefined>
}

export function useBuildItem (list: ListMeta): BuildItemHookResult {
  const [forceValidation, setForceValidation] = useState(false)
  const [value, setValue] = useState(() => {
    const value: Record<string, unknown> = {}
    for (const fieldPath in list.fields) {
      value[fieldPath] = list.fields[fieldPath].controller.defaultValue
    }
    return value
  })

  const invalidFields = useMemo(() => {
    const invalidFields = new Set<string>()

    for (const fieldPath in value) {
      const { controller } = list.fields[fieldPath]
      const fieldValue = value[fieldPath]

      const validateFn = controller.validate
      if (!validateFn) continue

      const valid = validateFn(fieldValue)
      if (valid) continue
      invalidFields.add(fieldPath)
    }

    return invalidFields
  }, [list, value])

  const data: Record<string, unknown> = {}
  for (const fieldPath in list.fields) {
    const { controller } = list.fields[fieldPath]
    const fieldValue = value[fieldPath]

    const serialized = controller.serialize(fieldValue)
    if (isDeepEqual(serialized, controller.serialize(controller.defaultValue))) continue

    Object.assign(data, serialized)
  }

  return {
    state: 'editing',
    props: {
      view: 'createView',
      fields: list.fields,
      groups: list.groups,
      forceValidation,
      invalidFields,
      value,
      onChange: (newItemValue) => setValue(newItemValue)
    },
    async build () {
      const newForceValidation = invalidFields.size !== 0
      setForceValidation(newForceValidation)
      if (newForceValidation) return undefined
      return data
    },
  }
}
