import type { KeystoneContext, GraphQLTypesForList } from '../../../types'
import type { UniqueInputFilter } from '../where-inputs'
import type { InitialisedList } from '../initialise-lists'
import { isRejected, isFulfilled } from '../utils'
import { userInputError } from '../graphql-errors'
import type { NestedMutationState } from './'
import { checkUniqueItemExists } from '../access-control'
import type { InferValueFromArg, GArg } from '@graphql-ts/schema'

type _CreateValueType = Exclude<
  InferValueFromArg<GArg<Exclude<GraphQLTypesForList['relateTo']['many']['create'], undefined>>>,
  null | undefined
>

type _UpdateValueType = Exclude<
  InferValueFromArg<GArg<Exclude<GraphQLTypesForList['relateTo']['many']['update'], undefined>>>,
  null | undefined
>

export class RelationshipErrors extends Error {
  errors: { error: Error; tag: string }[]
  constructor(errors: { error: Error; tag: string }[]) {
    super('Multiple relationship errors')
    this.errors = errors
  }
}

function getResolvedUniqueWheres(
  uniqueInputs: UniqueInputFilter[],
  context: KeystoneContext,
  foreignList: InitialisedList,
  operation: string
) {
  return uniqueInputs.map(uniqueInput =>
    checkUniqueItemExists(uniqueInput, foreignList, context, operation)
  )
}

export function resolveRelateToManyForCreateInput(
  nestedMutationState: NestedMutationState,
  context: KeystoneContext,
  foreignList: InitialisedList,
  tag: string
) {
  return async (value: _CreateValueType) => {
    if (
      !Array.isArray(value.connect) &&
      !Array.isArray(value.create) &&
      !Array.isArray(value.set)
    ) {
      throw userInputError(
        `You must provide at least one of "set", "connect" or "create" in to-many relationship inputs for "create" operations.`
      )
    }

    // Perform queries for the connections
    const connects = Promise.allSettled(
      getResolvedUniqueWheres(value.connect ?? [], context, foreignList, 'connect')
    )
    const sets = Promise.allSettled(
      getResolvedUniqueWheres(value.set ?? [], context, foreignList, 'set')
    )

    // Perform nested mutations for the creations
    const creates = Promise.allSettled(
      (value.create ?? []).map(x => nestedMutationState.create(x, foreignList))
    )

    // Resolve items
    const [connectResult, createResult, setResult] = await Promise.all([connects, creates, sets])

    // Collect all the errors
    const errors = [...connectResult, ...createResult, ...setResult].filter(isRejected)
    if (errors.length) throw new RelationshipErrors(errors.map(x => ({ error: x.reason, tag })))

    return {
      connect: [...setResult, ...connectResult, ...createResult]
        .filter(isFulfilled)
        .map(x => x.value),
    }
  }
}

export function resolveRelateToManyForUpdateInput(
  nestedMutationState: NestedMutationState,
  context: KeystoneContext,
  foreignList: InitialisedList,
  tag: string
) {
  return async (value: _UpdateValueType) => {
    if (
      !Array.isArray(value.connect) &&
      !Array.isArray(value.create) &&
      !Array.isArray(value.disconnect) &&
      !Array.isArray(value.set)
    ) {
      throw userInputError(
        `You must provide at least one of "set", "connect", "create" or "disconnect" in to-many relationship inputs for "update" operations.`
      )
    }

    if (value.set && value.disconnect) {
      throw userInputError(
        `The "set" and "disconnect" fields cannot both be provided to to-many relationship inputs for "update" operations.`
      )
    }

    // Perform queries for the connections
    const connects = Promise.allSettled(
      getResolvedUniqueWheres(value.connect ?? [], context, foreignList, 'connect')
    )
    const disconnects = Promise.allSettled(
      getResolvedUniqueWheres(value.disconnect ?? [], context, foreignList, 'disconnect')
    )
    const sets = Promise.allSettled(
      getResolvedUniqueWheres(value.set ?? [], context, foreignList, 'set')
    )

    // Perform nested mutations for the creations
    const creates = Promise.allSettled(
      (value.create ?? []).map(x => nestedMutationState.create(x, foreignList))
    )

    // Resolve items
    const [connectResult, createResult, disconnectResult, setResult] = await Promise.all([
      connects,
      creates,
      disconnects,
      sets,
    ])

    // Collect all the errors
    const errors = [...connectResult, ...createResult, ...disconnectResult, ...setResult].filter(
      isRejected
    )
    if (errors.length) throw new RelationshipErrors(errors.map(x => ({ error: x.reason, tag })))

    return {
      // unlike all the other operations, an empty array isn't a no-op for set
      set: value.set ? setResult.filter(isFulfilled).map(x => x.value) : undefined,
      disconnect: disconnectResult.filter(isFulfilled).map(x => x.value),
      connect: [...connectResult, ...createResult].filter(isFulfilled).map(x => x.value),
    }
  }
}
