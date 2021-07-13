import { getGqlNames, QueryMeta, schema } from '@keystone-next/types';
import { InitialisedList } from '../types-for-lists';
import { applyFirstSkipToCount } from '../utils';
import * as queries from './resolvers';

export function getQueriesForList(list: InitialisedList) {
  if (list.access.read === false) return {};
  const names = getGqlNames(list);

  const findOne = schema.field({
    type: list.types.output,
    args: {
      where: schema.arg({
        type: schema.nonNull(list.types.uniqueWhere),
      }),
    },
    description: ` Search for the ${list.listKey} item with the matching ID.`,
    async resolve(_rootVal, args, context) {
      return queries.findOne(args, list, context);
    },
  });
  const findMany = schema.field({
    type: schema.list(schema.nonNull(list.types.output)),
    args: list.types.findManyArgs,
    description: ` Search for all ${list.listKey} items which match the where clause.`,
    async resolve(_rootVal, args, context, info) {
      return queries.findMany(args, list, context, info);
    },
  });
  const countQuery = schema.field({
    type: schema.Int,
    args: {
      where: schema.arg({ type: schema.nonNull(list.types.where), defaultValue: {} }),
    },
    async resolve(_rootVal, args, context, info) {
      const count = await queries.count(args, list, context);
      if (info && info.cacheControl && list.cacheHint) {
        info.cacheControl.setCacheHint(
          list.cacheHint({
            results: count,
            operationName: info.operation.name?.value,
            meta: true,
          }) as any
        );
      }
      return count;
    },
  });

  const metaQuery = schema.field({
    type: QueryMeta,
    args: list.types.findManyArgs,
    description: ` Perform a meta-query on all ${list.listKey} items which match the where clause.`,
    resolve(_rootVal, { first, search, skip, where }, context, info) {
      return {
        getCount: async () => {
          const count = applyFirstSkipToCount({
            count: await queries.count({ where, search }, list, context),
            first,
            skip,
          });
          if (info && info.cacheControl && list.cacheHint) {
            info.cacheControl.setCacheHint(
              list.cacheHint({
                results: count,
                operationName: info.operation.name?.value,
                meta: true,
              }) as any
            );
          }
          return count;
        },
      };
    },
    deprecationReason: `This query will be removed in a future version. Please use ${names.listQueryCountName} instead.`,
  });
  return {
    [names.listQueryName]: findMany,
    [names.itemQueryName]: findOne,
    [names.listQueryMetaName]: metaQuery,
    [names.listQueryCountName]: countQuery,
  };
}
