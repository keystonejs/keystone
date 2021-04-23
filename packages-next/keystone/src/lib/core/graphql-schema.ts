import { GraphQLSchema } from 'graphql';
import { getGqlNames, KeystoneContext, types } from '@keystone-next/types';
import { getFindManyArgs } from '@keystone-next/types';
import { validateNonCreateListAccessControl } from '../createAccessControlContext.js';
import { InitialisedList } from './types-for-lists.js';

import { getPrismaModelForList } from './utils.js';
import {
  InputFilter,
  PrismaFilter,
  UniqueInputFilter,
  UniquePrismaFilter,
} from './input-resolvers.js';

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

// TODO: search
export async function getResolvedWhere(
  listKey: string,
  list: InitialisedList,
  context: KeystoneContext,
  where: InputFilter
): Promise<false | PrismaFilter> {
  const access = await validateNonCreateListAccessControl({
    access: list.access.read,
    args: {
      context,
      listKey,
      operation: 'read',
      session: context.session,
    },
  });
  if (!access) {
    return false;
  }
  let resolvedWhere = await list.inputResolvers.where(where || {});
  if (typeof access === 'object') {
    resolvedWhere = {
      AND: [resolvedWhere, await list.inputResolvers.where(access)],
    };
  }
  return resolvedWhere;
}

// this will need to do special things when we support multi-field unique indexes
// we want to do this explicit mapping because:
// - we are passing the values into a normal where filter and we want to ensure that fields cannot do non-unique filters(we don't do validation on non-unique wheres because prisma will validate all that)
// - for multi-field unique indexes, we need to a mapping because iirc findFirst/findMany won't understand the syntax for filtering by multi-field unique indexes(which makes sense and is correct imo)
function mapUniqueWhereToWhere(
  list: InitialisedList,
  uniqueWhere: UniquePrismaFilter
): PrismaFilter {
  // inputResolvers.uniqueWhere validates that there is only one key
  const key = Object.keys(uniqueWhere)[0];
  const dbField = list.fields[key].dbField;
  if (dbField.kind !== 'scalar' || (dbField.scalar !== 'String' && dbField.scalar !== 'Int')) {
    throw new Error(
      'Currently only String and Int scalar db fields can provide a uniqueWhere input'
    );
  }
  const val = uniqueWhere[key];
  if (dbField.scalar === 'Int' && typeof val !== 'number') {
    throw new Error('uniqueWhere inputs must return an integer for Int db fields');
  }
  if (dbField.scalar === 'String' && typeof val !== 'string') {
    throw new Error('uniqueWhere inputs must return an string for String db fields');
  }
  return { [key]: val };
}

export async function getItemByUniqueWhere(
  context: KeystoneContext,
  listKey: string,
  list: InitialisedList,
  uniqueWhere: UniqueInputFilter,
  access: InputFilter | boolean
) {
  if (access === false) {
    return null;
  }
  let resolvedUniqueWhere = await list.inputResolvers.uniqueWhere(uniqueWhere || {});
  const wherePrismaFilter = mapUniqueWhereToWhere(list, resolvedUniqueWhere);
  return getPrismaModelForList(context.prisma, listKey).findFirst({
    where:
      access === true
        ? wherePrismaFilter
        : [wherePrismaFilter, await list.inputResolvers.where(access)],
  });
}

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
              const access = await validateNonCreateListAccessControl({
                access: list.access.read,
                args: {
                  context,
                  listKey,
                  operation: 'read',
                  session: context.session,
                },
              });
              return getItemByUniqueWhere(context, listKey, list, where, access);
            },
          });
          const findManyArgs = getFindManyArgs(list.types);
          const findMany = types.field({
            type: types.nonNull(types.list(types.nonNull(list.types.output))),
            args: findManyArgs,
            async resolve(_rootVal, { where, sortBy, first, skip }, context) {
              const resolvedWhere = await getResolvedWhere(listKey, list, context, where || {});
              if (resolvedWhere === false) {
                return [];
              }
              return getPrismaModelForList(context.prisma, listKey).findMany({
                where: resolvedWhere,
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
                getCount: async () => {
                  const resolvedWhere = await getResolvedWhere(listKey, list, context, where || {});
                  if (resolvedWhere === false) {
                    return 0;
                  }
                  // TODO: check take skip things
                  return getPrismaModelForList(context.prisma, listKey).count({
                    where: resolvedWhere,
                    // TODO: needs to have input resolvers
                    orderBy: sortBy,
                    take: first ?? undefined,
                    skip,
                  });
                },
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
            data: types.arg({
              type: types.nonNull(
                types.list(
                  types.nonNull(
                    types.inputObject({
                      name: names.updateManyInputName,
                      fields: updateOneArgs,
                    })
                  )
                )
              ),
            }),
          },
          async resolve(_rootVal, {}, context) {
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
