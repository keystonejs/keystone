import { GraphQLSchema } from 'graphql';
import {
  DatabaseConfig,
  getGqlNames,
  ItemRootValue,
  KeystoneContext,
  types,
} from '@keystone-next/types';
import { getFindManyArgs } from '@keystone-next/types';
import { validateNonCreateListAccessControl } from '../context/createAccessControlContext';
import { InitialisedList } from './types-for-lists.js';

import { getPrismaModelForList } from './utils.js';
import {
  applyAccessControlForCreate,
  applyAccessControlForUpdate,
  InputFilter,
  PrismaFilter,
  processDelete,
  resolveInputForCreateOrUpdate,
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

// doing this is a result of an optimisation to skip doing a findUnique and then a findFirst(where the second one is done with access control)
// we want to do this explicit mapping because:
// - we are passing the values into a normal where filter and we want to ensure that fields cannot do non-unique filters(we don't do validation on non-unique wheres because prisma will validate all that)
// - for multi-field unique indexes, we need to a mapping because iirc findFirst/findMany won't understand the syntax for filtering by multi-field unique indexes(which makes sense and is correct imo)
export function mapUniqueWhereToWhere(
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

export function getGraphQLSchema(
  lists: Record<string, InitialisedList>,
  provider: NonNullable<DatabaseConfig['provider']>
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
            await applyAccessControlForCreate(listKey, list, context, rawData);
            const { data, afterChange } = await resolveInputForCreateOrUpdate(
              listKey,
              'create',
              list,
              context,
              rawData,
              undefined
            );
            const item = await getPrismaModelForList(context.prisma, listKey).create({
              data,
            });
            await afterChange(item);
            return item;
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
            const item = await applyAccessControlForUpdate(
              listKey,
              list,
              context,
              rawUniqueWhere,
              rawData
            );
            const { afterChange, data } = await resolveInputForCreateOrUpdate(
              listKey,
              'create',
              list,
              context,
              rawData,
              item
            );
            const updatedItem = await getPrismaModelForList(context.prisma, listKey).update({
              where: { id: item.id },
              data,
            });
            await afterChange(updatedItem);
            return updatedItem;
          },
        });
        const deleteOne = types.field({
          type: list.types.output,
          args: {
            id: types.arg({
              type: types.nonNull(types.ID),
            }),
          },
          async resolve(rootVal, { id }, context) {
            const { id: parsedId } = await list.inputResolvers.uniqueWhere({ id });
            const { afterDelete } = await processDelete(listKey, list, context, parsedId);
            const item = await getPrismaModelForList(context.prisma, listKey).delete({
              where: { id: parsedId },
            });
            await afterDelete();
            return item;
          },
        });

        const prismaCreateMany =
          provider === 'sqlite'
            ? async (data: Record<string, any>[], context: KeystoneContext) => {
                let results: ItemRootValue[] = [];
                const model = getPrismaModelForList(context.prisma, listKey);
                for (const item of data) {
                  results.push(await model.create({ data: item }));
                }
              }
            : (data: Record<string, any>[], context: KeystoneContext) => {
                const model = getPrismaModelForList(context.prisma, listKey);
                return context.prisma.$transaction(data.map(data => model.create({ data })));
              };

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
          async resolve(_rootVal, { data: rawDatas }, context) {
            const inputs = await Promise.all(
              rawDatas.map(async rawData => {
                await applyAccessControlForCreate(listKey, list, context, rawData);
                return resolveInputForCreateOrUpdate(
                  listKey,
                  'create',
                  list,
                  context,
                  rawData,
                  undefined
                );
              })
            );

            const items = await prismaCreateMany(
              inputs.map(x => x.data),
              context
            );
            await Promise.all(inputs.map((x, i) => x.afterChange(items[i])));
            return items;
          },
        });

        const prismaUpdateMany =
          provider === 'sqlite'
            ? async (
                data: { where: UniquePrismaFilter; data: Record<string, any> }[],
                context: KeystoneContext
              ) => {
                let results: ItemRootValue[] = [];
                const model = getPrismaModelForList(context.prisma, listKey);
                for (const stuff of data) {
                  results.push(await model.update(stuff));
                }
              }
            : (
                data: { where: UniquePrismaFilter; data: Record<string, any> }[],
                context: KeystoneContext
              ) => {
                const model = getPrismaModelForList(context.prisma, listKey);
                return context.prisma.$transaction(data.map(stuff => model.update(stuff)));
              };

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
          async resolve(_rootVal, { data }, context) {
            const things = await Promise.all(
              data.map(async ({ data: rawData, where: rawUniqueWhere }) => {
                const item = await applyAccessControlForUpdate(
                  listKey,
                  list,
                  context,
                  rawUniqueWhere,
                  rawData
                );
                return {
                  where: { id: item.id },
                  ...(await resolveInputForCreateOrUpdate(
                    listKey,
                    'create',
                    list,
                    context,
                    rawData,
                    item
                  )),
                };
              })
            );
            const updatedItems = await prismaUpdateMany(things, context);
            await Promise.all(things.map((x, index) => x.afterChange(updatedItems[index])));
            return updatedItems;
          },
        });
        const deleteMany = types.field({
          type: types.nonNull(types.list(types.nonNull(list.types.output))),
          args: {
            ids: types.arg({
              type: types.nonNull(types.list(types.nonNull(types.ID))),
            }),
          },
          async resolve(rootVal, { ids }, context) {
            const result = await Promise.all(
              ids.map(async id => {
                const { id: parsedId } = await list.inputResolvers.uniqueWhere({ id });
                const { afterDelete, existingItem } = await processDelete(
                  listKey,
                  list,
                  context,
                  parsedId
                );
                return {
                  parsedId,
                  after: async () => {
                    await afterDelete();
                    return existingItem;
                  },
                };
              })
            );
            await getPrismaModelForList(context.prisma, listKey).deleteMany({
              where: { id: { in: result.map(x => x.parsedId) } },
            });
            return Promise.all(result.map(({ after }) => after()));
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
  });
  return graphQLSchema;
}
