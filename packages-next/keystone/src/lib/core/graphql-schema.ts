import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { getGqlNames, DatabaseProvider, types } from '@keystone-next/types';
import { InitialisedList } from './types-for-lists';

import * as mutations from './mutation-resolvers';
import * as queries from './query-resolvers';

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
            async resolve(_rootVal, args, context) {
              return queries.findMany(args, listKey, list, context);
            },
          });
          const countQuery = types.field({
            type: types.Int,
            args: {
              where: types.arg({ type: types.nonNull(list.types.where), defaultValue: {} }),
            },
            async resolve(_rootVal, args, context) {
              return queries.count(args, listKey, list, context);
            },
          });
          return [
            [names.itemQueryName, findOne],
            [names.listQueryName, findMany],
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
            type: types.nonNull(list.types.create),
            defaultValue: {},
          }),
        };
        const createOne = types.field({
          type: list.types.output,
          args: createOneArgs,
          resolve(_rootVal, args, context) {
            return mutations.createOne(args, listKey, list, context);
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
          resolve(_rootVal, args, context) {
            return mutations.updateOne(args, listKey, list, context);
          },
        });
        const deleteOne = types.field({
          type: list.types.output,
          args: {
            where: types.arg({
              type: types.nonNull(list.types.uniqueWhere),
            }),
          },
          resolve(rootVal, args, context) {
            return mutations.deleteOne(args, listKey, list, context);
          },
        });

        const createMany = types.field({
          type: types.list(types.nonNull(list.types.output)),
          args: {
            data: types.arg({
              type: types.nonNull(types.list(types.nonNull(list.types.create))),
            }),
          },
          resolve(_rootVal, args, context) {
            return mutations.createMany(args, listKey, list, context, provider);
          },
        });

        const updateMany = types.field({
          type: types.list(types.nonNull(list.types.output)),
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
          resolve(_rootVal, args, context) {
            return mutations.updateMany(args, listKey, list, context, provider);
          },
        });
        const deleteMany = types.field({
          type: types.list(types.nonNull(list.types.output)),
          args: {
            where: types.arg({
              type: types.nonNull(types.list(types.nonNull(list.types.uniqueWhere))),
            }),
          },
          resolve(rootVal, args, context) {
            return mutations.deleteMany(args, listKey, list, context);
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
