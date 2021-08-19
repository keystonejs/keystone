import { getGqlNames, schema } from '../../../types';
import { InitialisedList } from '../types-for-lists';
import * as queries from './resolvers';

export function getQueriesForList(list: InitialisedList) {
  if (list.access.read === false) return {};
  const names = getGqlNames(list);

  const findOne = schema.field({
    type: list.types.output,
    args: { where: schema.arg({ type: schema.nonNull(list.types.uniqueWhere) }) },
    async resolve(_rootVal, args, context) {
      return queries.findOne(args, list, context);
    },
  });

  const findMany = schema.field({
    type: schema.list(schema.nonNull(list.types.output)),
    args: list.types.findManyArgs,
    async resolve(_rootVal, args, context, info) {
      return queries.findMany(args, list, context, info);
    },
  });

  const countQuery = schema.field({
    type: schema.Int,
    args: { where: schema.arg({ type: schema.nonNull(list.types.where), defaultValue: {} }) },
    async resolve(_rootVal, args, context, info) {
      return queries.count(args, list, context, info);
    },
  });

  return {
    [names.listQueryName]: findMany,
    [names.itemQueryName]: findOne,
    [names.listQueryCountName]: countQuery,
  };
}
