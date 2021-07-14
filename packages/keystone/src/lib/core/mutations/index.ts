import { DatabaseProvider, getGqlNames, schema } from '@keystone-next/types';
import { MutationError } from '../graphql-errors';
import { InitialisedList } from '../types-for-lists';
import * as createAndUpdate from './create-update';
import * as deletes from './delete';

// this is not a thing that i really agree with but it's to make the behaviour consistent with old keystone
// basically, old keystone uses Promise.allSettled and then after that maps that into promises that resolve and reject,
// whereas the new stuff is just like "here are some promises" with no guarantees about the order they will be settled in.
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

export function getMutationsForList(list: InitialisedList, provider: DatabaseProvider) {
  const names = getGqlNames(list);

  const createOne = schema.field({
    type: list.types.output,
    args: { data: schema.arg({ type: list.types.create }) },
    description: ` Create a single ${list.listKey} item.`,
    resolve(_rootVal, { data }, context) {
      return createAndUpdate.createOne({ data: data ?? {} }, list, context);
    },
  });

  // FIXME: Should this exist on list.types?
  const createManyInput = schema.inputObject({
    name: names.createManyInputName,
    fields: { data: schema.arg({ type: list.types.create }) },
  });
  const createMany = schema.field({
    type: schema.list(list.types.output),
    args: { data: schema.arg({ type: schema.list(createManyInput) }) },
    description: ` Create multiple ${list.listKey} items.`,
    resolve(_rootVal, args, context) {
      return promisesButSettledWhenAllSettledAndInOrder(
        createAndUpdate.createMany(
          { data: (args.data || []).map(input => input?.data ?? {}) },
          list,
          context,
          provider
        )
      );
    },
  });

  const updateOne = schema.field({
    type: list.types.output,
    args: {
      id: schema.arg({ type: schema.nonNull(schema.ID) }),
      data: schema.arg({ type: list.types.update }),
    },
    description: ` Update a single ${list.listKey} item by ID.`,
    resolve(_rootVal, { data, id }, context) {
      return createAndUpdate.updateOne({ data: data ?? {}, where: { id } }, list, context);
    },
  });

  // FIXME: Should this exist on list.types?
  const updateManyInput = schema.inputObject({
    name: names.updateManyInputName,
    fields: {
      id: schema.arg({ type: schema.nonNull(schema.ID) }),
      data: schema.arg({ type: list.types.update }),
    },
  });
  const updateMany = schema.field({
    type: schema.list(list.types.output),
    args: { data: schema.arg({ type: schema.list(updateManyInput) }) },
    description: ` Update multiple ${list.listKey} items by ID.`,
    resolve(_rootVal, { data }, context) {
      return promisesButSettledWhenAllSettledAndInOrder(
        createAndUpdate.updateMany(
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

  const deleteOne = schema.field({
    type: list.types.output,
    args: { id: schema.arg({ type: schema.nonNull(schema.ID) }) },
    description: ` Delete a single ${list.listKey} item by ID.`,
    resolve(rootVal, { id }, context) {
      return deletes.deleteOne({ where: { id } }, list, context);
    },
  });

  const deleteMany = schema.field({
    type: schema.list(list.types.output),
    args: { ids: schema.arg({ type: schema.list(schema.nonNull(schema.ID)) }) },
    description: ` Delete multiple ${list.listKey} items by ID.`,
    resolve(rootVal, { ids }, context) {
      return promisesButSettledWhenAllSettledAndInOrder(
        deletes.deleteMany({ where: (ids || []).map(id => ({ id })) }, list, context, provider)
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
    createManyInput,
  };
}

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

// these aren't here out of thinking this is better syntax(i do not think it is),
// it's just because TS won't infer the arg is X bit
export const isFulfilled = <T>(arg: PromiseSettledResult<T>): arg is PromiseFulfilledResult<T> =>
  arg.status === 'fulfilled';

export const isRejected = (arg: PromiseSettledResult<any>): arg is PromiseRejectedResult =>
  arg.status === 'rejected';

export async function promiseAllRejectWithMutationError<T extends unknown[]>(
  promises: readonly [...T]
): Promise<{ [P in keyof T]: Awaited<T[P]> }> {
  const results = await Promise.allSettled(promises);
  if (results.every(isFulfilled)) {
    return results.map((x: any) => x.value) as any;
  } else {
    throw MutationError(
      results
        .filter(isRejected)
        .map(x => x.reason)
        .map(e => ({ message: e.message, ...e }))
    );
  }
}
