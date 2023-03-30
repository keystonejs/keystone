import { graphql } from '../../..';
import { InitialisedList } from '../types-for-lists';
import * as queries from './resolvers';

export function getQueriesForList(list: InitialisedList) {
  if (!list.graphql.isEnabled.query) return {};

  const findOne = graphql.field({
    type: list.graphql.types.output,
    args: {
      where: graphql.arg({
        type: graphql.nonNull(list.graphql.types.uniqueWhere),
        defaultValue: list.isSingleton ? { id: '1' } : undefined,
      }),
    },
    async resolve(_rootVal, args, context) {
      return queries.findOne(args, list, context);
    },
  });

  const findMany = graphql.field({
    type: graphql.list(graphql.nonNull(list.graphql.types.output)),
    args: list.graphql.types.findManyArgs,
    async resolve(_rootVal, args, context, info) {
      return queries.findMany(args, list, context, info);
    },
  });

  const countQuery = graphql.field({
    type: graphql.Int,
    args: {
      where: graphql.arg({
        type: graphql.nonNull(list.graphql.types.where),
        defaultValue: list.isSingleton ? ({ id: { equals: '1' } } as {}) : {},
      }),
    },
    async resolve(_rootVal, args, context, info) {
      return queries.count(args, list, context, info);
    },
  });

  return {
    [list.graphql.names.listQueryName]: findMany,
    [list.graphql.names.itemQueryName]: findOne,
    [list.graphql.names.listQueryCountName]: countQuery,
  };
}
