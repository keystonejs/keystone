import { g } from '../../..'
import type { InitialisedList } from '../initialise-lists'
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
    async resolve(_rootVal, args, context, info) {
      return queries.findOne(args, list, context, info)
    },
  })

  const findMany = g.field({
    type: g.list(g.nonNull(list.graphql.types.output)),
    args: list.graphql.types.findManyArgs,
    async resolve(_rootVal, args, context, info) {
      return queries.findMany(args, list, context, info)
    },
  })

  const countQuery = g.field({
    type: g.Int,
    args: {
      where: g.arg({
        type: g.nonNull(list.graphql.types.where),
        defaultValue: list.isSingleton ? ({ id: { equals: '1' } } as object) : {},
      }),
    },
    async resolve(_rootVal, args, context, info) {
      return queries.count(args, list, context, info)
    },
  })

  return {
    [list.graphql.names.itemQueryName]: findOne,
    [list.graphql.names.listQueryName]: findMany,
    [list.graphql.names.listQueryCountName]: countQuery,
  }
}
