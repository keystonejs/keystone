import { GraphQLNamedType, GraphQLSchema } from 'graphql';
import { getGqlNames, DatabaseProvider, types, QueryMeta } from '@keystone-next/types';
import { InitialisedList } from './types-for-lists';

import * as mutations from './mutation-resolvers';
import * as queries from './query-resolvers';
import { applyFirstSkipToCount } from './utils';

// this is not a thing that i really agree with but it's to make the behaviour consistent with old keystone
// basically, old keystone uses Promise.allSettled and then after that maps that into promises that resolve and reject,
// whereas the new stuff is just like "here are some promises" with no guarantees about the order they will be settled in
// that doesn't matter when they all resolve successfully because the order they resolve successfully in
// doesn't affect anything, if some reject though, the order that they reject in will be the order in the errors array
// and some of our tests rely on the order of the graphql errors array. they shouldn't, but they do.
function promisesButSettledWhenAllSettledAndInOrder<T extends Promise<unknown>[]>(promises: T): T {
  const resultsPromise = Promise.allSettled(promises);
  return promises.map(async (_, i) => {
    const result = (await resultsPromise)[i];
    return result.status === 'fulfilled'
      ? Promise.resolve(result.value)
      : Promise.reject(result.reason);
  }) as T;
}

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
            async resolve(_rootVal, args, context) {
              return queries.findOne(args, list, context);
            },
          });
          const findMany = types.field({
            type: types.list(types.nonNull(list.types.output)),
            args: list.types.findManyArgs,
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
            [names.itemQueryName, findOne],
            [names.listQueryName, findMany],
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
    fields: Object.fromEntries(
      Object.values(lists).flatMap(list => {
        const names = getGqlNames(list);

        const createOneArgs = {
          data: types.arg({
            type: list.types.create,
          }),
        };
        const createOne = types.field({
          type: list.types.output,
          args: createOneArgs,
          resolve(_rootVal, { data }, context) {
            return mutations.createOne({ data: data ?? {} }, list, context);
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
            return mutations.updateOne({ data: data ?? {}, where: { id } }, list, context);
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
            return mutations.deleteOne({ where: { id } }, list, context);
          },
        });

        const createManyInput = types.inputObject({
          name: names.createManyInputName,
          fields: {
            data: types.arg({ type: list.types.create }),
          },
        });

        createManyByList[list.listKey] = createManyInput;

        const createMany = types.field({
          type: types.list(list.types.output),
          args: {
            data: types.arg({
              type: types.list(createManyInput),
            }),
          },
          async resolve(_rootVal, args, context) {
            return promisesButSettledWhenAllSettledAndInOrder(
              await mutations.createMany(
                { data: (args.data || []).map(input => input?.data ?? {}) },
                list,
                context,
                provider
              )
            );
          },
        });

        const updateManyInput = types.inputObject({
          name: names.updateManyInputName,
          fields: updateOneArgs,
        });

        updateManyByList[list.listKey] = updateManyInput;

        const updateMany = types.field({
          type: types.list(list.types.output),
          args: {
            data: types.arg({
              type: types.list(updateManyInput),
            }),
          },
          async resolve(_rootVal, { data }, context) {
            return promisesButSettledWhenAllSettledAndInOrder(
              await mutations.updateMany(
                {
                  data: (data || [])
                    .filter((x): x is NonNullable<typeof x> => x !== null)
                    .map(({ id, data }) => ({ where: { id: id }, data: data ?? {} })),
                },
                list,
                context,
                provider
              )
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
          async resolve(rootVal, { ids }, context) {
            return promisesButSettledWhenAllSettledAndInOrder(
              await mutations.deleteMany(
                { where: (ids || []).map(id => ({ id })) },
                list,
                context,
                provider
              )
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
    if (list.access.create) {
      types.push(list.types.create.graphQLType);
      types.push(createManyByList[list.listKey].graphQLType);
    }
    if (list.access.update) {
      types.push(list.types.update.graphQLType);
      types.push(updateManyByList[list.listKey].graphQLType);
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
