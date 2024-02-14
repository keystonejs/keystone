import { type CacheHint, maybeCacheControlFromInfo } from '@apollo/cache-control-types'
import { type GraphQLResolveInfo } from 'graphql'
import DataLoader from 'dataloader'
import type {
  NextFieldType,
  IndividualFieldAccessControl,
  BaseListTypeInfo,
  BaseItem,
  FindManyArgsValue,
  KeystoneContext,
  GraphQLTypesForList,
  FieldReadItemAccessArgs,
} from '../../../types'
import { graphql } from '../../..'
import { getOperationAccess, getAccessFilters } from '../access-control'
import type { ResolvedDBField, ResolvedRelationDBField } from '../resolve-relationships'
import type { InitialisedList } from '../initialise-lists'
import { type IdType, getDBFieldKeyForFieldOnMultiField } from '../utils'
import { accessReturnError, extensionError } from '../graphql-errors'
import { accessControlledFilter } from './resolvers'
import * as queries from './resolvers'

function getRelationVal (
  dbField: ResolvedRelationDBField,
  id: IdType,
  foreignList: InitialisedList,
  context: KeystoneContext,
  info: GraphQLResolveInfo,
  fk: IdType | null | undefined
) {
  const oppositeDbField = foreignList.resolvedDbFields[dbField.field]
  if (oppositeDbField.kind !== 'relation') throw new Error('failed assert')

  if (dbField.mode === 'many') {
    const relationFilter = {
      [dbField.field]: oppositeDbField.mode === 'many' ? { some: { id } } : { id },
    }
    return {
      findMany: async (args: FindManyArgsValue) =>
        queries.findMany(args, foreignList, context, info, relationFilter),
      count: async ({ where }: { where: GraphQLTypesForList['where'] }) =>
        queries.count({ where }, foreignList, context, info, relationFilter),
    }
  } else {
    return async () => {
      if (fk === null) {
        // If the foreign key is explicitly null, there's no need to anything else,
        // since we know the related item doesn't exist.
        return null
      }
      // for one-to-many relationships, the one side always owns the foreign key
      // so that means we have the id for the related item and we're fetching it by _its_ id.
      // for the a one-to-one relationship though, the id might be on the related item
      // so we need to fetch the related item by the id of the current item on the foreign key field
      const currentItemOwnsForeignKey = fk !== undefined
      return fetchRelatedItem(context)(foreignList)(
        currentItemOwnsForeignKey ? 'id' : `${dbField.field}Id`
      )(currentItemOwnsForeignKey ? fk : id)
    }
  }
}

function weakMemoize<Arg extends object, Return> (cb: (arg: Arg) => Return) {
  const cache = new WeakMap<Arg, Return>()
  return (arg: Arg) => {
    if (!cache.has(arg)) {
      const result = cb(arg)
      cache.set(arg, result)
    }
    return cache.get(arg)!
  }
}

function memoize<Arg, Return> (cb: (arg: Arg) => Return) {
  const cache = new Map<Arg, Return>()
  return (arg: Arg) => {
    if (!cache.has(arg)) {
      const result = cb(arg)
      cache.set(arg, result)
    }
    return cache.get(arg)!
  }
}

const fetchRelatedItem = weakMemoize((context: KeystoneContext) =>
  weakMemoize((foreignList: InitialisedList) =>
    memoize((idFieldKey: string) => {
      const relatedItemLoader = new DataLoader(
        (keys: readonly IdType[]) => fetchRelatedItems(context, foreignList, idFieldKey, keys),
        { cache: false }
      )
      return (id: IdType) => relatedItemLoader.load(id)
    })
  )
)

async function fetchRelatedItems (
  context: KeystoneContext,
  foreignList: InitialisedList,
  idFieldKey: string,
  toFetch: readonly IdType[]
) {
  const operationAccess = await getOperationAccess(foreignList, context, 'query')
  if (!operationAccess) {
    return toFetch.map(() => undefined)
  }

  const accessFilters = await getAccessFilters(foreignList, context, 'query')
  if (accessFilters === false) {
    return toFetch.map(() => undefined)
  }

  const resolvedWhere = await accessControlledFilter(
    foreignList,
    context,
    { [idFieldKey]: { in: toFetch } },
    accessFilters
  )

  const results = await context.prisma[foreignList.listKey].findMany({ where: resolvedWhere })
  const resultsById = new Map(results.map((x: any) => [x[idFieldKey], x]))
  return toFetch.map(id => resultsById.get(id))
}

function getValueForDBField (
  rootVal: BaseItem,
  dbField: ResolvedDBField,
  id: IdType,
  fieldPath: string,
  context: KeystoneContext,
  lists: Record<string, InitialisedList>,
  info: GraphQLResolveInfo
) {
  if (dbField.kind === 'multi') {
    return Object.fromEntries(
      Object.keys(dbField.fields).map(innerDBFieldKey => {
        const keyOnDbValue = getDBFieldKeyForFieldOnMultiField(fieldPath, innerDBFieldKey)
        return [innerDBFieldKey, rootVal[keyOnDbValue] as any]
      })
    )
  }
  if (dbField.kind === 'relation') {
    // If we're holding a foreign key value, let's take advantage of that.
    let fk: IdType | undefined
    if (dbField.mode === 'one' && dbField.foreignIdField.kind !== 'none') {
      fk = rootVal[`${fieldPath}Id`] as IdType
    }
    return getRelationVal(dbField, id, lists[dbField.list], context, info, fk)
  } else {
    return rootVal[fieldPath] as any
  }
}

export function outputTypeField (
  output: NextFieldType['output'],
  dbField: ResolvedDBField,
  cacheHint: CacheHint | undefined,
  access: IndividualFieldAccessControl<FieldReadItemAccessArgs<BaseListTypeInfo>>,
  listKey: string,
  fieldKey: string,
  lists: Record<string, InitialisedList>
) {
  return graphql.field({
    type: output.type,
    deprecationReason: output.deprecationReason,
    description: output.description,
    args: output.args,
    extensions: output.extensions,
    async resolve (rootVal: BaseItem, args, context, info) {
      const id = (rootVal as any).id as IdType

      let canAccess
      try {
        canAccess = await access({
          context,
          fieldKey,
          item: rootVal,
          listKey,
          operation: 'read',
          session: context.session,
        })
      } catch (error: any) {
        throw extensionError('Access control', [
          { error, tag: `${listKey}.${fieldKey}.access.read` },
        ])
      }
      if (typeof canAccess !== 'boolean') {
        throw accessReturnError([
          { tag: `${listKey}.${fieldKey}.access.read`, returned: typeof canAccess },
        ])
      }
      if (!canAccess) {
        return null
      }

      // Only static cache hints are supported at the field level until a use-case makes it clear what parameters a dynamic hint would take
      if (cacheHint && info) {
        maybeCacheControlFromInfo(info)?.setCacheHint(cacheHint)
      }

      const value = getValueForDBField(rootVal, dbField, id, fieldKey, context, lists, info)

      if (output.resolve) {
        return output.resolve({ value, item: rootVal }, args, context, info)
      } else {
        return value
      }
    },
  })
}
