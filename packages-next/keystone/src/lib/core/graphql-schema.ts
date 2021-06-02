import { GraphQLNamedType, GraphQLSchema } from 'graphql';
import { getGqlNames, DatabaseProvider, types, QueryMeta } from '@keystone-next/types';
import { InitialisedList } from './types-for-lists';

import * as queries from './query-resolvers';
import { applyFirstSkipToCount } from './utils';
import { getMutationsForList } from './mutations';

export function getGraphQLSchema(
  lists: Record<string, InitialisedList>,
  provider: DatabaseProvider
) {
  let query = types.object()({
    name: 'Query',
    fields: () =>
      Object.fromEntries(
        Object.values(lists).flatMap(list => {
          if (list.access.read === false) return [];
          const names = getGqlNames(list);

          const findOne = types.field({
            type: list.types.output,
            args: {
              where: types.arg({
                type: types.nonNull(list.types.uniqueWhere),
              }),
            },
            description: ` Search for the ${list.listKey} item with the matching ID.`,
            async resolve(_rootVal, args, context) {
              return queries.findOne(args, list, context);
            },
          });
          const findMany = types.field({
            type: types.list(types.nonNull(list.types.output)),
            args: list.types.findManyArgs,
            description: ` Search for all ${list.listKey} items which match the where clause.`,
            async resolve(_rootVal, args, context, info) {
              return queries.findMany(args, list, context, info);
            },
          });
          const countQuery = types.field({
            type: types.Int,
            args: {
              where: types.arg({ type: types.nonNull(list.types.where), defaultValue: {} }),
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

          const metaQuery = types.field({
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
          return [
            [names.listQueryName, findMany],
            [names.itemQueryName, findOne],
            [names.listQueryMetaName, metaQuery],
            [names.listQueryCountName, countQuery],
          ];
        })
      ),
  } as any);

  const createManyByList: Record<string, types.InputObjectType<any>> = {};
  const updateManyByList: Record<string, types.InputObjectType<any>> = {};

  let mutation = types.object()({
    name: 'Mutation',
    fields: Object.assign(
      {},
      ...Object.values(lists).map(list => {
        const { mutations, createManyInput, updateManyInput } = getMutationsForList(list, provider);
        createManyByList[list.listKey] = createManyInput;
        updateManyByList[list.listKey] = updateManyInput;
        return mutations;
      })
    ),
  });
  let graphQLSchema = new GraphQLSchema({
    query: query.graphQLType,
    mutation: mutation.graphQLType,
    types: collectTypes(lists, createManyByList, updateManyByList),
  });
  return graphQLSchema;
}

function collectTypes(
  lists: Record<string, InitialisedList>,
  createManyByList: Record<string, types.InputObjectType<any>>,
  updateManyByList: Record<string, types.InputObjectType<any>>
) {
  const types: GraphQLNamedType[] = [];
  for (const list of Object.values(lists)) {
    // adding all of these types explicitly isn't strictly necessary but we do it to create a certain order in the schema
    if (list.access.read || list.access.create || list.access.update || list.access.delete) {
      types.push(list.types.output.graphQLType);
      types.push(list.types.where.graphQLType);
      types.push(list.types.uniqueWhere.graphQLType);
      types.push(list.types.findManyArgs.sortBy.type.of.of.graphQLType);
      types.push(list.types.orderBy.graphQLType);
    }
    if (list.access.update) {
      types.push(list.types.update.graphQLType);
      types.push(updateManyByList[list.listKey].graphQLType);
    }
    if (list.access.create) {
      types.push(list.types.create.graphQLType);
      types.push(createManyByList[list.listKey].graphQLType);
    }

    for (const field of Object.values(list.fields)) {
      if (
        list.access.read !== false &&
        field.access.read !== false &&
        field.unreferencedConcreteInterfaceImplementations
      ) {
        types.push(...field.unreferencedConcreteInterfaceImplementations.map(x => x.graphQLType));
      }
    }
  }
  return types;
}
