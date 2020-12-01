import { GraphQLSchema } from 'graphql';
import {
  BaseGeneratedListTypes,
  BaseKeystoneList,
  KeystoneListsAPI,
  KeystoneContext,
} from '@keystone-next/types';
import { getCoerceAndValidateArgumentsFnForGraphQLField } from './getCoerceAndValidateArgumentsFnForGraphQLField';

export function itemAPIForList(
  list: BaseKeystoneList,
  context: KeystoneContext,
  schema: GraphQLSchema
): KeystoneListsAPI<Record<string, BaseGeneratedListTypes>>[string] {
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
      return list.itemQuery(args as any, context);
    },
    findMany(rawArgs) {
      const args = getArgsForFindMany(rawArgs);
      return list.listQuery(args, context);
    },
    async count(rawArgs) {
      const args = getArgsForMeta(rawArgs);
      return (await list.listQueryMeta(args, context)).getCount();
    },
    createOne(rawArgs) {
      const { data } = getArgsForCreateOne(rawArgs);
      return list.createMutation(data, context);
    },
    createMany(rawArgs) {
      const { data } = getArgsForCreateMany(rawArgs);
      return list.createManyMutation(data, context);
    },
    updateOne(rawArgs) {
      const { id, data } = getArgsForUpdateOne(rawArgs);
      return list.updateMutation(id, data, context);
    },
    updateMany(rawArgs) {
      const { data } = getArgsForUpdateMany(rawArgs);
      return list.updateManyMutation(data, context);
    },
    deleteOne(rawArgs) {
      const { id } = getArgsForDeleteOne(rawArgs);
      return list.deleteMutation(id, context);
    },
    deleteMany(rawArgs) {
      const { ids } = getArgsForDeleteMany(rawArgs);
      return list.deleteManyMutation(ids, context);
    },
  };
}
