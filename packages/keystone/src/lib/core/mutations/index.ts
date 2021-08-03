import { DatabaseProvider, getGqlNames, schema } from '@keystone-next/types';
import { InitialisedList } from '../types-for-lists';
import * as createAndUpdate from './create-update';
import * as deletes from './delete';

// This is not a thing that I really agree with but it's to make the behaviour consistent with old keystone.
// Basically, old keystone uses Promise.allSettled and then after that maps that into promises that resolve and reject,
// whereas the new stuff is just like "here are some promises" with no guarantees about the order they will be settled in.
// That doesn't matter when they all resolve successfully because the order they resolve successfully in
// doesn't affect anything, If some reject though, the order that they reject in will be the order in the errors array
// and some of our tests rely on the order of the graphql errors array. They shouldn't, but they do.
function promisesButSettledWhenAllSettledAndInOrder<T extends Promise<unknown>[]>(promises: T): T {
  const resultsPromise = Promise.allSettled(promises);
  return promises.map(async (_, i) => {
    const result = (await resultsPromise)[i];
    return result.status === 'fulfilled'
      ? Promise.resolve(result.value)
      : Promise.reject(result.reason);
  }) as T;
}

export function getMutationsForList(list: InitialisedList, provider: DatabaseProvider) {
  const names = getGqlNames(list);

  const createOne = schema.field({
    type: list.types.output,
    args: { data: schema.arg({ type: schema.nonNull(list.types.create) }) },
    resolve(_rootVal, { data }, context) {
      return createAndUpdate.createOne({ data }, list, context);
    },
  });

  const createMany = schema.field({
    type: schema.list(list.types.output),
    args: {
      data: schema.arg({ type: schema.nonNull(schema.list(schema.nonNull(list.types.create))) }),
    },
    resolve(_rootVal, args, context) {
      return promisesButSettledWhenAllSettledAndInOrder(
        createAndUpdate.createMany(args, list, context, provider)
      );
    },
  });

  const updateOne = schema.field({
    type: list.types.output,
    args: {
      where: schema.arg({ type: schema.nonNull(list.types.uniqueWhere) }),
      data: schema.arg({ type: schema.nonNull(list.types.update) }),
    },
    resolve(_rootVal, args, context) {
      return createAndUpdate.updateOne(args, list, context);
    },
  });

  const updateManyInput = schema.inputObject({
    name: names.updateManyInputName,
    fields: {
      where: schema.arg({ type: schema.nonNull(list.types.uniqueWhere) }),
      data: schema.arg({ type: schema.nonNull(list.types.update) }),
    },
  });
  const updateMany = schema.field({
    type: schema.list(list.types.output),
    args: {
      data: schema.arg({ type: schema.nonNull(schema.list(schema.nonNull(updateManyInput))) }),
    },
    resolve(_rootVal, args, context) {
      return promisesButSettledWhenAllSettledAndInOrder(
        createAndUpdate.updateMany(args, list, context, provider)
      );
    },
  });

  const deleteOne = schema.field({
    type: list.types.output,
    args: { where: schema.arg({ type: schema.nonNull(list.types.uniqueWhere) }) },
    resolve(rootVal, { where }, context) {
      return deletes.deleteOne(where, list, context);
    },
  });

  const deleteMany = schema.field({
    type: schema.list(list.types.output),
    args: {
      where: schema.arg({
        type: schema.nonNull(schema.list(schema.nonNull(list.types.uniqueWhere))),
      }),
    },
    resolve(rootVal, { where }, context) {
      return promisesButSettledWhenAllSettledAndInOrder(
        deletes.deleteMany(where, list, context, provider)
      );
    },
  });

  return {
    mutations: {
      ...(list.access.create !== false && {
        [names.createMutationName]: createOne,
        [names.createManyMutationName]: createMany,
      }),
      ...(list.access.update !== false && {
        [names.updateMutationName]: updateOne,
        [names.updateManyMutationName]: updateMany,
      }),
      ...(list.access.delete !== false && {
        [names.deleteMutationName]: deleteOne,
        [names.deleteManyMutationName]: deleteMany,
      }),
    },
    updateManyInput,
  };
}
