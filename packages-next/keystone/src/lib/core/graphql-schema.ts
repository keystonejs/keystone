import { GraphQLSchema } from 'graphql';
import { getGqlNames, types } from '@keystone-next/types';
import { getFindManyArgs } from '@keystone-next/types';
import { InitialisedList } from './types-for-lists';
// import { runInputResolvers } from './input-resolvers';

import { getPrismaModelForList } from './utils';

const queryMeta = types.object<{ getCount: () => Promise<number> }>()({
  name: '_QueryMeta',
  fields: {
    count: types.field({
      type: types.Int,
      resolve({ getCount }) {
        return getCount();
      },
    }),
  },
});

export function getGraphQLSchema(lists: Record<string, InitialisedList>) {
  let query = types.object()({
    name: 'Query',
    fields: () =>
      Object.fromEntries(
        Object.entries(lists).flatMap(([listKey, list]) => {
          const names = getGqlNames({ listKey, ...list });
          const findOne = types.field({
            type: list.types.output,
            args: {
              where: types.arg({
                type: types.nonNull(list.types.uniqueWhere),
              }),
            },
            async resolve(_rootVal, { where }, context) {
              //   return getPrismaModelForList(context.prisma, listKey).findUnique({
              //     where: await runInputResolvers(typesForLists, lists, listKey, 'uniqueWhere', where),
              //   });
            },
          });
          const findManyArgs = getFindManyArgs(list.types);
          const findMany = types.field({
            type: types.nonNull(types.list(types.nonNull(list.types.output))),
            args: findManyArgs,
            async resolve(_rootVal, { where, sortBy, first, skip }, context) {
              return getPrismaModelForList(context.prisma, listKey).findMany({
                // where: await runInputResolvers(typesForLists, lists, listKey, 'where', where || {}),
                // TODO: needs to have input resolvers
                orderBy: sortBy,
                take: first ?? undefined,
                skip,
              });
            },
          });
          const metaQuery = types.field({
            type: queryMeta,
            args: findManyArgs,
            async resolve(_rootVal, { where, sortBy, first, skip }, context) {
              return {
                getCount: () =>
                  getPrismaModelForList(context.prisma, listKey).count({
                    // where: await runInputResolvers(
                    //   typesForLists,
                    //   lists,
                    //   listKey,
                    //   'where',
                    //   where || {}
                    // ),
                    // TODO: needs to have input resolvers
                    orderBy: sortBy,
                    take: first ?? undefined,
                    skip,
                  }),
              };
            },
          });
          return [
            [names.itemQueryName, findOne],
            [names.listQueryName, findMany],
            [names.listQueryMetaName, metaQuery],
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
            type: types.nonNull(list.types.create),
            defaultValue: {},
          }),
        };
        const createOne = types.field({
          type: types.nonNull(list.types.output),
          args: createOneArgs,
          async resolve(_rootVal, { data: rawData }, context) {
            // const data = await runInputResolvers(typesForLists, lists, listKey, 'create', rawData);
            // return getPrismaModelForList(context.prisma, listKey).create({
            //   data,
            // });
          },
        });
        const updateOneArgs = {
          where: types.arg({
            type: types.nonNull(list.types.uniqueWhere),
          }),
          data: types.arg({
            type: types.nonNull(list.types.update),
          }),
        };
        const updateOne = types.field({
          type: list.types.output,
          args: updateOneArgs,
          async resolve(_rootVal, { where: rawUniqueWhere, data: rawData }, context) {
            // const [data, where] = await Promise.all([
            //   runInputResolvers(typesForLists, lists, listKey, 'update', rawData),
            //   runInputResolvers(typesForLists, lists, listKey, 'uniqueWhere', rawUniqueWhere),
            // ]);
            // return getPrismaModelForList(context.prisma, listKey).update({
            //   where,
            //   data,
            // });
          },
        });
        const deleteOne = types.field({
          type: list.types.output,
          args: {
            where: types.arg({
              type: types.nonNull(list.types.uniqueWhere),
            }),
          },
          async resolve(rootVal, { where }, context) {
            // return getPrismaModelForList(context.prisma, listKey).delete({
            //   //   where: runInputResolvers(typesForLists, lists, listKey, 'uniqueWhere', where),
            // });
          },
        });
        const createMany = types.field({
          type: types.nonNull(types.list(types.nonNull(list.types.output))),
          args: {
            data: types.arg({
              type: types.nonNull(
                types.list(
                  types.nonNull(
                    types.inputObject({
                      name: names.createManyInputName,
                      fields: {
                        data: types.arg({
                          type: types.nonNull(list.types.create),
                        }),
                      },
                    })
                  )
                )
              ),
              defaultValue: [],
            }),
          },
          async resolve(_rootVal, { data: rawData }, context) {
            // const data = await runInputResolvers(typesForLists, lists, listKey, 'create', rawData);
            // return getPrismaModelForList(context.prisma, listKey).create({
            //   data,
            // });
          },
        });
        const updateMany = types.field({
          type: list.types.output,
          args: {
            data: types,
          },
          async resolve(_rootVal, { where: rawUniqueWhere, data: rawData }, context) {
            // const [data, where] = await Promise.all([
            //   runInputResolvers(typesForLists, lists, listKey, 'update', rawData),
            //   runInputResolvers(typesForLists, lists, listKey, 'uniqueWhere', rawUniqueWhere),
            // ]);
            // return getPrismaModelForList(context.prisma, listKey).update({
            //   where,
            //   data,
            // });
          },
        });
        const deleteMany = types.field({
          type: list.types.output,
          args: {
            where: types.arg({
              type: types.nonNull(list.types.where),
              defaultValue: {},
            }),
          },
          async resolve(rootVal, { where }, context) {
            // return getPrismaModelForList(context.prisma, listKey).delete({
            //   //   where: runInputResolvers(typesForLists, lists, listKey, 'uniqueWhere', where),
            // });
          },
        });

        return [
          [names.createMutationName, createOne],
          [names.updateMutationName, updateOne],
          [names.deleteMutationName, deleteOne],
          [names.createManyMutationName, createMany],
          [names.updateManyMutationName, updateMany],
          [names.deleteManyMutationName, deleteMany],
        ];
      })
    ),
  });
  let graphQLSchema = new GraphQLSchema({
    query: query.graphQLType,
    mutation: mutation.graphQLType,
  });
  return graphQLSchema;
}
