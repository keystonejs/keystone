import {
  BaseGeneratedListTypes,
  BaseKeystoneList,
  Keystone,
  KeystoneCrudAPI,
} from '@keystone-next/types';
import { GraphQLSchema } from 'graphql';
import { getCoerceAndValidateArgumentsFnForGraphQLField } from './getCoerceAndValidateArgumentsFnForGraphQLField';

export function crudForList(
  list: BaseKeystoneList,
  schema: GraphQLSchema,
  createContext: Keystone['createContext']
): KeystoneCrudAPI<Record<string, BaseGeneratedListTypes>>[string] {
  const queryFields = schema.getQueryType()!.getFields();
  const mutationFields = schema.getMutationType()!.getFields();

  const getArgsForFindOne = getCoerceAndValidateArgumentsFnForGraphQLField(
    schema,
    queryFields[list.gqlNames.itemQueryName]
  );

  const getArgsForFindMany = getCoerceAndValidateArgumentsFnForGraphQLField(
    schema,
    queryFields[list.gqlNames.listQueryName]
  );

  const getArgsForMeta = getCoerceAndValidateArgumentsFnForGraphQLField(
    schema,
    queryFields[list.gqlNames.listQueryMetaName]
  );

  const getArgsForCreateOne = getCoerceAndValidateArgumentsFnForGraphQLField(
    schema,
    mutationFields[list.gqlNames.createMutationName]
  );

  const getArgsForCreateMany = getCoerceAndValidateArgumentsFnForGraphQLField(
    schema,
    mutationFields[list.gqlNames.createManyMutationName]
  );

  const getArgsForUpdateOne = getCoerceAndValidateArgumentsFnForGraphQLField(
    schema,
    mutationFields[list.gqlNames.updateMutationName]
  );

  const getArgsForUpdateMany = getCoerceAndValidateArgumentsFnForGraphQLField(
    schema,
    mutationFields[list.gqlNames.updateManyMutationName]
  );

  const getArgsForDeleteOne = getCoerceAndValidateArgumentsFnForGraphQLField(
    schema,
    mutationFields[list.gqlNames.deleteMutationName]
  );

  const getArgsForDeleteMany = getCoerceAndValidateArgumentsFnForGraphQLField(
    schema,
    mutationFields[list.gqlNames.deleteManyMutationName]
  );

  return {
    findOne(rawArgs) {
      const args = getArgsForFindOne(rawArgs);
      return list.itemQuery(args as any, createContext({ skipAccessControl: true }));
    },
    findMany(rawArgs) {
      const args = getArgsForFindMany(rawArgs);
      return list.listQuery(args, createContext({ skipAccessControl: true }));
    },
    count(rawArgs) {
      const args = getArgsForMeta(rawArgs);
      return list.listQueryMeta(args, createContext({ skipAccessControl: true })).getCount();
    },
    createOne(rawArgs) {
      const { data } = getArgsForCreateOne(rawArgs);
      return list.createMutation(data, createContext({ skipAccessControl: true }));
    },
    createMany(rawArgs) {
      const { data } = getArgsForCreateMany(rawArgs);
      return list.createManyMutation(data, createContext({ skipAccessControl: true }));
    },
    updateOne(rawArgs) {
      const { id, data } = getArgsForUpdateOne(rawArgs);
      return list.updateMutation(id, data, createContext({ skipAccessControl: true }));
    },
    updateMany(rawArgs) {
      const { data } = getArgsForUpdateMany(rawArgs);
      return list.updateManyMutation(data, createContext({ skipAccessControl: true }));
    },
    deleteOne(rawArgs) {
      const { id } = getArgsForDeleteOne(rawArgs);
      return list.deleteMutation(id, createContext({ skipAccessControl: true }));
    },
    deleteMany(rawArgs) {
      const { ids } = getArgsForDeleteMany(rawArgs);
      return list.deleteManyMutation(ids, createContext({ skipAccessControl: true }));
    },
  };
}
