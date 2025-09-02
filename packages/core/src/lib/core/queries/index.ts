import { g } from '../../..'
import type { InitialisedList } from '../initialise-lists'
import { withSpan } from '../../otel'
import * as queries from './resolvers'

export function getQueriesForList(list: InitialisedList) {
  if (!list.graphql.isEnabled.query) return {}

  const findOne = g.field({
    type: list.graphql.types.output,
    args: {
      where: g.arg({
        type: g.nonNull(list.graphql.types.uniqueWhere),
        defaultValue: list.isSingleton ? { id: '1' } : undefined,
      }),
    },
    async resolve(_, args, context, info) {
      return await withSpan(
        info.fieldName,
        async () => {
          return queries.findOne(args, list, context, info)
        },
        { 'keystone.list': list.listKey }
      )
    },
  })

  const findMany = g.field({
    type: g.list(g.nonNull(list.graphql.types.output)),
    args: list.graphql.types.findManyArgs,
    async resolve(_, args, context, info) {
      return await withSpan(
        info.fieldName,
        async () => {
          return queries.findMany(args, list, context, info)
        },
        { 'keystone.list': list.listKey }
      )
    },
  })

  const countQuery = g.field({
    type: g.Int,
    args: {
      where: g.arg({
        type: g.nonNull(list.graphql.types.where),
        defaultValue: list.isSingleton ? { id: { equals: '1' } } : {},
      }),
    },
    async resolve(_, args, context, info) {
      return await withSpan(
        info.fieldName,
        async () => {
          return queries.count(args, list, context, info)
        },
        { 'keystone.list': list.listKey }
      )
    },
  })

  return {
    [list.graphql.names.itemQueryName]: findOne,
    [list.graphql.names.listQueryName]: findMany,
    [list.graphql.names.listQueryCountName]: countQuery,
  }
}
