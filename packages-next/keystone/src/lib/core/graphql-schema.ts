import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { getGqlNames, DatabaseProvider, types, QueryMeta } from '@keystone-next/types';
import { InitialisedList } from './types-for-lists';

import * as mutations from './mutation-resolvers';
import * as queries from './query-resolvers';
import { applyFirstSkipToCount } from './utils';

export function getGraphQLSchema(
  lists: Record<string, InitialisedList>,
  provider: DatabaseProvider
) {
  let query = types.object()({
    name: 'Query',
    fields: () =>
      Object.fromEntries(
        Object.entries(lists).flatMap(([listKey, list]) => {
          if (list.access.read === false) return [];
          const names = getGqlNames({ listKey, ...list });

          const findOne = types.field({
            type: list.types.output,
            args: {
              where: types.arg({
                type: types.nonNull(list.types.uniqueWhere),
              }),
            },
            async resolve(_rootVal, args, context) {
              return queries.findOne(args, listKey, list, context);
            },
          });
          const findMany = types.field({
            type: types.list(types.nonNull(list.types.output)),
            args: list.types.findManyArgs,
            async resolve(_rootVal, args, context, info) {
              const results = await queries.findMany(args, listKey, list, context);
              if (info && info.cacheControl && list.cacheHint) {
                const operationName = info.operation.name && info.operation.name.value;
                console.log(
                  list.cacheHint({ results, operationName: operationName!, meta: false })
                );
                info.cacheControl.setCacheHint(
                  list.cacheHint({ results, operationName: operationName!, meta: false }) as any
                );
              }
              return results;
            },
          });
          const countQuery = types.field({
            type: types.Int,
            args: {
              where: types.arg({ type: types.nonNull(list.types.where), defaultValue: {} }),
            },
            async resolve(_rootVal, args, context, info) {
              const count = await queries.count(args, listKey, list, context);
              if (info && info.cacheControl && list.cacheHint) {
                const operationName = info.operation.name && info.operation.name.value;
                info.cacheControl.setCacheHint(
                  list.cacheHint({
                    results: count,
                    operationName: operationName!,
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
            resolve(_rootVal, { first, search, skip, where }, context, info) {
              return {
                getCount: async () => {
                  const count = applyFirstSkipToCount({
                    count: await queries.count({ where, search }, listKey, list, context),
                    first,
                    skip,
                  });
                  if (info && info.cacheControl && list.cacheHint) {
                    const operationName = info.operation.name && info.operation.name.value;
                    info.cacheControl.setCacheHint(
                      list.cacheHint({
                        results: count,
                        operationName: operationName!,
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
            [names.itemQueryName, findOne],
            [names.listQueryName, findMany],
            [names.listQueryMetaName, metaQuery],
            [names.listQueryCountName, countQuery],
          ];
        })
      ),
  } as any);

  let mutation = types.object()({
    name: 'Mutation',
    fields: Object.fromEntries(
      Object.entries(lists).flatMap(([listKey, list]) => {
        const names = getGqlNames({ listKey, ...list });

        const createOneArgs = {
          data: types.arg({
            type: list.types.create,
          }),
        };
        const createOne = types.field({
          type: list.types.output,
          args: createOneArgs,
          resolve(_rootVal, { data }, context) {
            return mutations.createOne({ data: data ?? {} }, listKey, list, context);
          },
        });
        const updateOneArgs = {
          id: types.arg({
            type: types.nonNull(types.ID),
          }),
          data: types.arg({
            type: list.types.update,
          }),
        };
        const updateOne = types.field({
          type: list.types.output,
          args: updateOneArgs,
          resolve(_rootVal, { data, id }, context) {
            return mutations.updateOne({ data: data ?? {}, where: { id } }, listKey, list, context);
          },
        });
        const deleteOne = types.field({
          type: list.types.output,
          args: {
            id: types.arg({
              type: types.nonNull(types.ID),
            }),
          },
          resolve(rootVal, { id }, context) {
            return mutations.deleteOne({ where: { id } }, listKey, list, context);
          },
        });

        const createMany = types.field({
          type: types.list(list.types.output),
          args: {
            data: types.arg({
              type: types.list(
                types.inputObject({
                  name: names.createManyInputName,
                  fields: {
                    data: types.arg({ type: list.types.create }),
                  },
                })
              ),
            }),
          },
          resolve(_rootVal, args, context) {
            return mutations.createMany(
              { data: (args.data || []).map(input => input?.data ?? {}) },
              listKey,
              list,
              context,
              provider
            );
          },
        });

        const updateMany = types.field({
          type: types.list(list.types.output),
          args: {
            data: types.arg({
              type: types.list(
                types.inputObject({
                  name: names.updateManyInputName,
                  fields: updateOneArgs,
                })
              ),
            }),
          },
          resolve(_rootVal, { data }, context) {
            return mutations.updateMany(
              {
                data: (data || [])
                  .filter((x): x is NonNullable<typeof x> => x !== null)
                  .map(({ id, data }) => ({ where: { id: id }, data: data ?? {} })),
              },
              listKey,
              list,
              context,
              provider
            );
          },
        });
        const deleteMany = types.field({
          type: types.list(list.types.output),
          args: {
            ids: types.arg({
              type: types.list(types.nonNull(types.ID)),
            }),
          },
          resolve(rootVal, { ids }, context) {
            return mutations.deleteMany(
              { where: (ids || []).map(id => ({ id })) },
              listKey,
              list,
              context,
              provider
            );
          },
        });

        return [
          ...(list.access.create === false
            ? []
            : [
                [names.createMutationName, createOne],
                [names.createManyMutationName, createMany],
              ]),
          ...(list.access.update === false
            ? []
            : [
                [names.updateMutationName, updateOne],
                [names.updateManyMutationName, updateMany],
              ]),
          ...(list.access.delete === false
            ? []
            : [
                [names.deleteMutationName, deleteOne],
                [names.deleteManyMutationName, deleteMany],
              ]),
        ];
      })
    ),
  });
  let graphQLSchema = new GraphQLSchema({
    query: query.graphQLType,
    mutation: mutation.graphQLType,
    types: collectUnreferencedConcreteInterfaceImplementations(lists),
  });
  return graphQLSchema;
}

function collectUnreferencedConcreteInterfaceImplementations(
  lists: Record<string, InitialisedList>
) {
  const unreferencedConcreteInterfaceImplementations: GraphQLObjectType[] = [];
  for (const list of Object.values(lists)) {
    if (list.access.read === false) continue;
    for (const field of Object.values(list.fields)) {
      if (field.access.read !== false && field.unreferencedConcreteInterfaceImplementations) {
        unreferencedConcreteInterfaceImplementations.push(
          ...field.unreferencedConcreteInterfaceImplementations.map(x => x.graphQLType)
        );
      }
    }
  }
  return unreferencedConcreteInterfaceImplementations;
}
