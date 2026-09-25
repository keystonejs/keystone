import { type CacheHint, maybeCacheControlFromInfo } from '@apollo/cache-control-types'
import DataLoader from 'dataloader'
import type { GraphQLResolveInfo } from 'graphql/index.js'

import { g } from '../../../index.ts'
import { itemFieldsExtension } from '../../../types/item-field.ts'
import type {
  BaseItem,
  BaseListTypeInfo,
  FieldAccessControlFunction,
  FieldReadItemAccessArgs,
  FindManyArgsValue,
  KeystoneContext,
  NextFieldType,
} from '../../../types/index.ts'
import {
  getAccessFilters,
  getOperationFieldAccess,
  getOperationQueryAccess,
} from '../access-control.ts'
import type { InitialisedList } from '../initialise-lists.ts'
import type { ResolvedDBField, ResolvedRelationDBField } from '../resolve-relationships.ts'
import { type IdType, getDBFieldKeyForFieldOnMultiField, weakMemoize } from '../utils.ts'
import * as queries from './resolvers.ts'
import { accessControlledFilter } from './resolvers.ts'
import { getOutputFieldRequirements, selectFromInfo } from './select.ts'

function getRelationVal(
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
      count: async ({ where }: { where: Record<string, unknown> }) =>
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
      const selection = getRelatedSelection(foreignList)(info.fragments)(info.returnType)(info)
      return fetchRelatedItem(context)(foreignList)(selection)(dbField)(
        currentItemOwnsForeignKey,
        currentItemOwnsForeignKey ? fk : id
      )
    }
  }
}

type RelatedSelection = { select: Record<string, true> | null }

// GraphQL.js shares fieldNodes across sibling items, so they receive the same selection key.
const getRelatedSelection = weakMemoize((foreignList: InitialisedList) =>
  weakMemoize((_fragments: GraphQLResolveInfo['fragments']) =>
    weakMemoize((_returnType: GraphQLResolveInfo['returnType']) => {
      const selections = new WeakMap<GraphQLResolveInfo['fieldNodes'], RelatedSelection>()
      return (info: GraphQLResolveInfo) => {
        let selection = selections.get(info.fieldNodes)
        if (!selection) {
          selection = { select: selectFromInfo(foreignList, info) ?? null }
          selections.set(info.fieldNodes, selection)
        }
        return selection
      }
    })
  )
)

const fetchRelatedItem = weakMemoize((context: KeystoneContext) =>
  weakMemoize((foreignList: InitialisedList) =>
    weakMemoize((selection: RelatedSelection) =>
      weakMemoize((dbField: ResolvedRelationDBField) => {
        const loaders: {
          byId?: DataLoader<IdType, any>
          byForeignKey?: DataLoader<IdType, any>
        } = {}
        return (ownsForeignKey: boolean, id: IdType) => {
          const slot = ownsForeignKey ? 'byId' : 'byForeignKey'
          let loader = loaders[slot]
          if (!loader) {
            const idFieldKey = ownsForeignKey ? 'id' : `${dbField.field}Id`
            loader = new DataLoader(
              (keys: readonly IdType[]) =>
                fetchRelatedItems(context, foreignList, selection.select, idFieldKey, keys),
              { cache: false }
            )
            loaders[slot] = loader
          }
          return loader.load(id)
        }
      })
    )
  )
)

async function fetchRelatedItems(
  context: KeystoneContext,
  foreignList: InitialisedList,
  select: Record<string, true> | null,
  idFieldKey: string,
  toFetch: readonly IdType[]
) {
  const operationAccess = await getOperationQueryAccess(foreignList, context, 'one')
  if (!operationAccess) {
    return toFetch.map(() => undefined)
  }

  const accessFilters = await getAccessFilters(foreignList, context, 'query')
  if (accessFilters === false) {
    return toFetch.map(() => undefined)
  }

  const toFetchUnique = Array.from(new Set(toFetch))
  const resolvedWhere = await accessControlledFilter(
    foreignList,
    context,
    { [idFieldKey]: { in: toFetchUnique } },
    accessFilters
  )

  const results = await context.prisma[foreignList.listKey].findMany({
    where: resolvedWhere,
    select: select && { ...select, [idFieldKey]: true },
  })
  const resultsById = new Map(results.map((x: any) => [x[idFieldKey], x]))
  return toFetch.map(id => resultsById.get(id))
}

function getValueForDBField(
  item: BaseItem,
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
        return [innerDBFieldKey, item[keyOnDbValue] as any]
      })
    )
  }
  if (dbField.kind === 'relation') {
    // If we're holding a foreign key value, let's take advantage of that.
    let fk: IdType | undefined
    if (dbField.mode === 'one' && dbField.foreignIdField.kind !== 'none') {
      fk = item[`${fieldPath}Id`] as IdType
    }
    return getRelationVal(dbField, id, lists[dbField.list], context, info, fk)
  } else {
    return item[fieldPath] as any
  }
}

export function outputTypeField(
  output: NextFieldType['output'],
  dbField: ResolvedDBField,
  cacheHint: CacheHint | undefined,
  access: FieldAccessControlFunction<FieldReadItemAccessArgs<BaseListTypeInfo>>,
  listKey: string,
  fieldKey: string,
  lists: Record<string, InitialisedList>
) {
  const list = lists[listKey]

  return g.field({
    type: output.type,
    deprecationReason: output.deprecationReason,
    description: output.description,
    args: output.args,
    extensions: {
      ...output.extensions,
      [itemFieldsExtension]: getOutputFieldRequirements(list, fieldKey, output) ?? null,
    },
    async resolve(item: BaseItem, args, context, info) {
      const id = item.id as IdType
      const fieldAccess = await getOperationFieldAccess(item, list, fieldKey, context, 'read')
      if (!fieldAccess) return null

      // only static cache hints are supported at the field level until a use-case makes it clear what parameters a dynamic hint would take
      if (cacheHint && info) {
        maybeCacheControlFromInfo(info)?.setCacheHint(cacheHint)
      }

      const value = getValueForDBField(item, dbField, id, fieldKey, context, lists, info)
      if (output.resolve) {
        return output.resolve({ value, item: item }, args, context, info)
      } else {
        return value
      }
    },
  })
}
