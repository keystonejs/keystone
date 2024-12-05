import isDeepEqual from 'fast-deep-equal'
import { useRouter } from 'next/router'
import {
  type ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { toastQueue } from '@keystar/ui/toast'

import type { ListMeta } from '../../types'
import { type ApolloError, gql, useMutation } from '../apollo'
import { useKeystone } from '../context'
import { usePreventNavigation } from './usePreventNavigation'
import type { Fields, Value } from '.'

type ValueWithoutServerSideErrors = { [key: string]: { kind: 'value', value: any } }

type CreateItemHookResult = {
  state: 'editing' | 'loading' | 'created'
  shouldPreventNavigation: boolean
  error?: ApolloError
  props: ComponentProps<typeof Fields>
  create: () => Promise<{ id: string, label: string | null } | undefined>
}

export function useCreateItem (list: ListMeta): CreateItemHookResult {
  const { createViewFieldModes } = useKeystone()
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
    const value: ValueWithoutServerSideErrors = {}
    for (const fieldPath in list.fields) {
      value[fieldPath] = {
        kind: 'value',
        value: list.fields[fieldPath].controller.defaultValue
      }
    }
    return value
  })

  const invalidFields = useMemo(() => {
    const invalidFields = new Set<string>()

    for (const fieldPath in value) {
      const val = value[fieldPath].value
      const validateFn = list.fields[fieldPath].controller.validate
      if (!validateFn) continue
      const result = validateFn(val)
      if (result === false) {
        invalidFields.add(fieldPath)
      }
    }

    return invalidFields
  }, [list, value])

  const data: Record<string, any> = {}
  for (const fieldPath in list.fields) {
    const { controller } = list.fields[fieldPath]
    const serialized = controller.serialize(value[fieldPath].value)
    if (!isDeepEqual(serialized, controller.serialize(controller.defaultValue))) {
      Object.assign(data, serialized)
    }
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
      fields: list.fields,
      groups: list.groups,
      fieldModes: createViewFieldModes.state === 'loaded' ? createViewFieldModes.lists[list.key] : null,
      forceValidation,
      invalidFields,
      value,
      onChange: useCallback((getNewValue: (value: Value) => Value) => {
        setValue(oldValues => getNewValue(oldValues) as ValueWithoutServerSideErrors)
      }, []),
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

export function useBuildItem (list: ListMeta) {
  const { createViewFieldModes } = useKeystone()

  const [forceValidation, setForceValidation] = useState(false)
  const [value, setValue] = useState(() => {
    const value: ValueWithoutServerSideErrors = {}
    for (const fieldPath in list.fields) {
      value[fieldPath] = {
        kind: 'value',
        value: list.fields[fieldPath].controller.defaultValue
      }
    }
    return value
  })

  const invalidFields = useMemo(() => {
    const invalidFields = new Set<string>()

    for (const fieldPath in value) {
      const val = value[fieldPath].value
      const validateFn = list.fields[fieldPath].controller.validate
      if (!validateFn) continue
      const result = validateFn(val)
      if (result === false) {
        invalidFields.add(fieldPath)
      }
    }

    return invalidFields
  }, [list, value])

  const data: Record<string, any> = {}
  for (const fieldPath in list.fields) {
    const { controller } = list.fields[fieldPath]
    const serialized = controller.serialize(value[fieldPath].value)
    if (!isDeepEqual(serialized, controller.serialize(controller.defaultValue))) {
      Object.assign(data, serialized)
    }
  }

  return {
    state: 'editing',
    props: {
      fields: list.fields,
      groups: list.groups,
      fieldModes: createViewFieldModes.state === 'loaded' ? createViewFieldModes.lists[list.key] : null,
      forceValidation,
      invalidFields,
      value,
      onChange: useCallback((getNewValue: (value: Value) => Value) => {
        setValue(oldValues => getNewValue(oldValues) as ValueWithoutServerSideErrors)
      }, []),
    },
    async build () {
      const newForceValidation = invalidFields.size !== 0
      setForceValidation(newForceValidation)
      if (newForceValidation) return undefined
      return data
    },
  }
}
