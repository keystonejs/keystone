import { graphql } from '@keystone-6/core'
import { type BaseItem, type FieldData, type GraphQLTypesForList, type KeystoneContext } from '@keystone-6/core/types'
import { type GraphQLResolveInfo } from 'graphql'

import { type ComponentSchemaForGraphQL } from './DocumentEditor/component-blocks/api'
import { getInitialPropsValue } from './DocumentEditor/component-blocks/initial-values'
import { assertNever, type ReadonlyPropPath } from './DocumentEditor/component-blocks/utils'

export function getGraphQLInputType (
  name: string,
  schema: ComponentSchemaForGraphQL,
  operation: 'create' | 'update',
  cache: Map<ComponentSchemaForGraphQL, graphql.InputType>,
  meta: FieldData
) {
  if (!cache.has(schema)) {
    const res = getGraphQLInputTypeInner(name, schema, operation, cache, meta)
    cache.set(schema, res)
  }
  return cache.get(schema)!
}

function getGraphQLInputTypeInner (
  name: string,
  schema: ComponentSchemaForGraphQL,
  operation: 'create' | 'update',
  cache: Map<ComponentSchemaForGraphQL, graphql.InputType>,
  meta: FieldData
): graphql.InputType {
  if (schema.kind === 'form') {
    return schema.graphql.input
  }
  if (schema.kind === 'object') {
    return graphql.inputObject({
      name: `${name}${operation[0].toUpperCase()}${operation.slice(1)}Input`,
      fields: () =>
        Object.fromEntries(
          Object.entries(schema.fields).map(
            ([key, val]): [string, graphql.Arg<graphql.InputType>] => {
              const type = getGraphQLInputType(
                `${name}${key[0].toUpperCase()}${key.slice(1)}`,
                val,
                operation,
                cache,
                meta
              )
              return [key, graphql.arg({ type })]
            }
          )
        ),
    })
  }
  if (schema.kind === 'array') {
    const innerType = getGraphQLInputType(name, schema.element, operation, cache, meta)
    return graphql.list(innerType)
  }
  if (schema.kind === 'conditional') {
    return graphql.inputObject({
      name: `${name}${operation[0].toUpperCase()}${operation.slice(1)}Input`,
      fields: () =>
        Object.fromEntries(
          Object.entries(schema.values).map(
            ([key, val]): [string, graphql.Arg<graphql.InputType>] => {
              const type = getGraphQLInputType(
                `${name}${key[0].toUpperCase()}${key.slice(1)}`,
                val,
                operation,
                cache,
                meta
              )
              return [key, graphql.arg({ type })]
            }
          )
        ),
    })
  }

  if (schema.kind === 'relationship') {
    const inputType =
      meta.lists[schema.listKey].types.relateTo[schema.many ? 'many' : 'one'][operation]
    // there are cases where this won't exist
    // for example if gql omit is enabled on the related field
    if (inputType === undefined) {
      throw new Error('')
    }
    return inputType
  }

  assertNever(schema)
}

export async function getValueForUpdate (
  schema: ComponentSchemaForGraphQL,
  value: any,
  prevValue: any,
  context: KeystoneContext,
  path: ReadonlyPropPath
): Promise<any> {
  if (value === undefined) {
    return prevValue
  }
  if (prevValue === undefined) {
    prevValue = getInitialPropsValue(schema)
  }

  if (schema.kind === 'form') {
    if (schema.validate(value)) {
      return value
    }
    throw new Error(`The value of the form field at '${path.join('.')}' is invalid`)
  }
  if (value === null) {
    throw new Error(
      `${
        schema.kind[0].toUpperCase() + schema.kind.slice(1)
      } fields cannot be set to null but the field at '${path.join('.')}' is null`
    )
  }
  if (schema.kind === 'object') {
    return Object.fromEntries(
      await Promise.all(
        Object.entries(schema.fields).map(async ([key, val]) => {
          return [
            key,
            await getValueForUpdate(val, value[key], prevValue[key], context, path.concat(key)),
          ]
        })
      )
    )
  }
  if (schema.kind === 'array') {
    return Promise.all(
      (value as any[]).map((val, i) =>
        getValueForUpdate(schema.element, val, prevValue[i], context, path.concat(i))
      )
    )
  }
  if (schema.kind === 'relationship') {
    if (schema.many) {
      const val = (value as graphql.InferValueFromArg<
        graphql.Arg<NonNullable<GraphQLTypesForList['relateTo']['many']['update']>>
      >)!
      return resolveRelateToManyForUpdateInput(val, context, schema.listKey, prevValue)
    } else {
      const val = (value as graphql.InferValueFromArg<
        graphql.Arg<NonNullable<GraphQLTypesForList['relateTo']['one']['update']>>
      >)!

      return resolveRelateToOneForUpdateInput(val, context, schema.listKey)
    }
  }
  if (schema.kind === 'conditional') {
    const conditionalValueKeys = Object.keys(value)
    if (conditionalValueKeys.length !== 1) {
      throw new Error(
        `Conditional field inputs must set exactly one of the fields but the field at ${path.join(
          '.'
        )} has ${conditionalValueKeys.length} fields set`
      )
    }
    const key = conditionalValueKeys[0]
    let discriminant: string | boolean = key
    if ((key === 'true' || key === 'false') && !schema.discriminant.validate(key)) {
      discriminant = key === 'true'
    }
    return {
      discriminant,
      value: await getValueForUpdate(
        (schema.values as any)[key],
        value[key],
        prevValue.discriminant === discriminant ? prevValue.value : getInitialPropsValue(schema),
        context,
        path.concat('value')
      ),
    }
  }

  assertNever(schema)
}

export async function getValueForCreate (
  schema: ComponentSchemaForGraphQL,
  value: any,
  context: KeystoneContext,
  path: ReadonlyPropPath
): Promise<any> {
  // If value is undefined, get the specified defaultValue
  if (value === undefined) {
    return getInitialPropsValue(schema)
  }
  if (schema.kind === 'form') {
    if (schema.validate(value)) {
      return value
    }
    throw new Error(`The value of the form field at '${path.join('.')}' is invalid`)
  }
  if (value === null) {
    throw new Error(
      `${
        schema.kind[0].toUpperCase() + schema.kind.slice(1)
      } fields cannot be set to null but the field at '${path.join('.')}' is null`
    )
  }
  if (schema.kind === 'array') {
    return Promise.all(
      (value as any[]).map((val, i) =>
        getValueForCreate(schema.element, val, context, path.concat(i))
      )
    )
  }
  if (schema.kind === 'object') {
    return Object.fromEntries(
      await Promise.all(
        Object.entries(schema.fields).map(async ([key, val]) => {
          return [key, await getValueForCreate(val, value[key], context, path.concat(key))]
        })
      )
    )
  }
  if (schema.kind === 'relationship') {
    if (schema.many) {
      const val = (value as graphql.InferValueFromArg<
        graphql.Arg<NonNullable<GraphQLTypesForList['relateTo']['many']['create']>>
      >)!

      return resolveRelateToManyForCreateInput(val, context, schema.listKey)
    } else {
      const val = (value as graphql.InferValueFromArg<
        graphql.Arg<NonNullable<GraphQLTypesForList['relateTo']['one']['create']>>
      >)!

      return resolveRelateToOneForCreateInput(val, context, schema.listKey)
    }
  }
  if (schema.kind === 'conditional') {
    if (value === null) {
      throw new Error()
    }
    const conditionalValueKeys = Object.keys(value)
    if (conditionalValueKeys.length !== 1) {
      throw new Error()
    }
    const key = conditionalValueKeys[0]
    let discriminant: string | boolean = key
    if ((key === 'true' || key === 'false') && !schema.discriminant.validate(key)) {
      discriminant = key === 'true'
    }

    return {
      discriminant,
      value: await getValueForCreate(
        (schema.values as any)[key],
        value[key],
        context,
        path.concat('value')
      ),
    }
  }

  assertNever(schema)
}
/** MANY */

type _CreateValueManyType = Exclude<
  graphql.InferValueFromArg<
    graphql.Arg<Exclude<GraphQLTypesForList['relateTo']['many']['create'], undefined>>
  >,
  null | undefined
>

type _UpdateValueManyType = Exclude<
  graphql.InferValueFromArg<
    graphql.Arg<Exclude<GraphQLTypesForList['relateTo']['many']['update'], undefined>>
  >,
  null | undefined
>

export class RelationshipErrors extends Error {
  errors: { error: Error, tag: string }[]
  constructor (errors: { error: Error, tag: string }[]) {
    super('Multiple relationship errors')
    this.errors = errors
  }
}

function getResolvedUniqueWheres (
  uniqueInputs: Record<string, any>[],
  context: KeystoneContext,
  foreignListKey: string,
  operation: string
) {
  return uniqueInputs.map(uniqueInput =>
    checkUniqueItemExists(uniqueInput, foreignListKey, context, operation)
  )
}

// these aren't here out of thinking this is better syntax(i do not think it is),
// it's just because TS won't infer the arg is X bit
export const isFulfilled = <T, >(arg: PromiseSettledResult<T>): arg is PromiseFulfilledResult<T> =>
  arg.status === 'fulfilled'
export const isRejected = (arg: PromiseSettledResult<any>): arg is PromiseRejectedResult =>
  arg.status === 'rejected'

export async function resolveRelateToManyForCreateInput (
  value: _CreateValueManyType,
  context: KeystoneContext,
  foreignListKey: string,
  tag?: string
) {
  if (!Array.isArray(value.connect) && !Array.isArray(value.create)) {
    throw new Error(
      `You must provide "connect" or "create" in to-many relationship inputs for "create" operations.`
    )
  }

  // Perform queries for the connections
  const connects = Promise.allSettled(
    getResolvedUniqueWheres(value.connect || [], context, foreignListKey, 'connect')
  )

  // Perform nested mutations for the creations
  const creates = Promise.allSettled(
    (value.create || []).map(x => resolveCreateMutation(x, context, foreignListKey))
  )

  const [connectResult, createResult] = await Promise.all([connects, creates])

  // Collect all the errors
  const errors = [...connectResult, ...createResult].filter(isRejected)
  if (errors.length) {
    // readd tag
    throw new RelationshipErrors(errors.map(x => ({ error: x.reason, tag: tag || '' })))
  }

  // Perform queries for the connections
  return [...connectResult, ...createResult].filter(isFulfilled).map(x => x.value)
}

export async function resolveRelateToManyForUpdateInput (
  value: _UpdateValueManyType,
  context: KeystoneContext,
  foreignListKey: string,
  prevVal: { id: string }[]
) {
  if (
    !Array.isArray(value.connect) &&
    !Array.isArray(value.create) &&
    !Array.isArray(value.disconnect) &&
    !Array.isArray(value.set)
  ) {
    throw new Error(
      `You must provide at least one of "set", "connect", "create" or "disconnect" in to-many relationship inputs for "update" operations.`
    )
  }
  if (value.set && value.disconnect) {
    throw new Error(
      `The "set" and "disconnect" fields cannot both be provided to to-many relationship inputs for "update" operations.`
    )
  }

  // Perform queries for the connections
  const connects = Promise.allSettled(
    getResolvedUniqueWheres(value.connect || [], context, foreignListKey, 'connect')
  )

  const disconnects = Promise.allSettled(
    getResolvedUniqueWheres(value.disconnect || [], context, foreignListKey, 'disconnect')
  )

  const sets = Promise.allSettled(
    getResolvedUniqueWheres(value.set || [], context, foreignListKey, 'set')
  )

  // Perform nested mutations for the creations
  const creates = Promise.allSettled(
    (value.create || []).map(x => resolveCreateMutation(x, context, foreignListKey))
  )

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
  if (errors.length) {
    throw new RelationshipErrors(errors.map(x => ({ error: x.reason, tag: '' })))
  }

  let values = prevVal

  if (value.set) {
    values = setResult.filter(isFulfilled).map(x => x.value)
  }

  const idsToDisconnect = new Set(disconnectResult.filter(isFulfilled).map(x => x.value.id))
  values = values.filter(x => !idsToDisconnect.has(x.id))
  values.push(...connectResult.filter(isFulfilled).map(x => x.value))
  values.push(...createResult.filter(isFulfilled).map(x => x.value))

  return values
}

/** ONE */

type _CreateValueType = Exclude<
  graphql.InferValueFromArg<
    graphql.Arg<Exclude<GraphQLTypesForList['relateTo']['one']['create'], undefined>>
  >,
  null | undefined
>
type _UpdateValueType = Exclude<
  graphql.InferValueFromArg<
    graphql.Arg<
      graphql.NonNullType<Exclude<GraphQLTypesForList['relateTo']['one']['update'], undefined>>
    >
  >,
  null | undefined
>

const missingItem = (operation: string, uniqueWhere: Record<string, any>) => {
  throw new Error(
    `You cannot perform the '${operation}' operation on the item '${JSON.stringify(
      uniqueWhere
    )}'. It may not exist.`
  )
}

export async function checkUniqueItemExists (
  uniqueInput: Record<string, unknown>,
  listKey: string,
  context: KeystoneContext,
  operation: string
) {
  // Check whether the item exists (from this users POV).
  const item = await context.db[listKey].findOne({ where: uniqueInput })
  if (item === null) {
    throw missingItem(operation, uniqueInput)
  }

  return { id: item.id.toString() }
}

async function handleCreateAndUpdate (
  value: _CreateValueType,
  context: KeystoneContext,
  foreignListKey: string
) {
  if (value.connect) {
    return checkUniqueItemExists(value.connect, foreignListKey, context, 'connect')
  } else if (value.create) {
    return resolveCreateMutation(value, context, foreignListKey)
  }
}

async function resolveCreateMutation (value: any, context: KeystoneContext, foreignListKey: string) {
  const mutationType = context.graphql.schema.getMutationType()!
  const { id } = (await mutationType.getFields()[
    context.__internal.lists[foreignListKey].graphql.names.createMutationName
  ].resolve!(
    {},
    { data: value.create },
    context,
    // we happen to know this isn't used
    // no one else should rely on that though
    // it could change in the future
    {} as GraphQLResolveInfo
  )) as BaseItem
  return { id: id.toString() }
}

export function resolveRelateToOneForCreateInput (
  value: _CreateValueType,
  context: KeystoneContext,
  foreignListKey: string
) {
  const numOfKeys = Object.keys(value).length
  if (numOfKeys !== 1) {
    throw new Error(
      `You must provide "connect" or "create" in to-one relationship inputs for "create" operations.`
    )
  }
  return handleCreateAndUpdate(value, context, foreignListKey)
}

export function resolveRelateToOneForUpdateInput (
  value: _UpdateValueType,
  context: KeystoneContext,
  foreignListKey: string
) {
  if (Object.keys(value).length !== 1) {
    throw new Error(
      `You must provide one of "connect", "create" or "disconnect" in to-one relationship inputs for "update" operations.`
    )
  }

  if (value.connect || value.create) {
    return handleCreateAndUpdate(value, context, foreignListKey)
  } else if (value.disconnect) {
    return null
  }
}
