import { KeystoneContext, Provider } from '@keystone-next/types';
import {
  applyAccessControlForCreate,
  applyAccessControlForUpdate,
  processDelete,
  resolveInputForCreateOrUpdate,
  resolveUniqueWhereInput,
} from './input-resolvers';
import { addToNestedMutationState, commitNestedMutation, InitialisedList } from './types-for-lists';
import { getPrismaModelForList, IdType } from './utils';

export async function createMany(
  { data }: { data: { data: Record<string, any> }[] },
  listKey: string,
  list: InitialisedList,
  context: KeystoneContext,
  provider: Provider
) {
  const nestedMutationState = list.inputResolvers.createAndUpdate(context);
  const rootOperations = await Promise.all(
    data.map(async ({ data: rawData }) => {
      await applyAccessControlForCreate(listKey, list, context, rawData);
      const { data, afterChange } = await resolveInputForCreateOrUpdate(
        listKey,
        'create',
        list,
        context,
        rawData,
        undefined,
        nestedMutationState.resolvers
      );
      return {
        handler: afterChange,
        operation: getPrismaModelForList(context.prisma, listKey).create({ data }),
      };
    })
  );
  nestedMutationState.operations.push(...rootOperations);
  const items = await commitNestedMutation(nestedMutationState, context, provider);
  return items.slice(-rootOperations.length);
}
/** The last operation in the NestedMutationState returned is guaranteed to the main item being created */
export async function createOneState(
  { data: rawData }: { data: Record<string, any> },
  listKey: string,
  list: InitialisedList,
  context: KeystoneContext
) {
  await applyAccessControlForCreate(listKey, list, context, rawData);
  const nestedMutationState = list.inputResolvers.createAndUpdate(context);
  const { data, afterChange } = await resolveInputForCreateOrUpdate(
    listKey,
    'create',
    list,
    context,
    rawData,
    undefined,
    nestedMutationState.resolvers
  );
  const createPrismaPromise = getPrismaModelForList(context.prisma, listKey).create({
    data,
  });
  addToNestedMutationState(
    { operation: createPrismaPromise, handler: afterChange },
    nestedMutationState
  );
  return { nestedMutationState, id: data.id as undefined | IdType };
}

export async function createOne(
  args: { data: Record<string, any> },
  listKey: string,
  list: InitialisedList,
  context: KeystoneContext,
  provider: Provider
) {
  const { nestedMutationState } = await createOneState(args, listKey, list, context);
  const items = await commitNestedMutation(nestedMutationState, context, provider);
  return items[items.length - 1];
}

export async function updateMany(
  { data }: { data: { where: Record<string, any>; data: Record<string, any> }[] },
  listKey: string,
  list: InitialisedList,
  context: KeystoneContext,
  provider: Provider
) {
  const nestedMutationState = list.inputResolvers.createAndUpdate(context);
  const rootOperations = await Promise.all(
    data.map(async ({ data: rawData, where: rawUniqueWhere }) => {
      const item = await applyAccessControlForUpdate(
        listKey,
        list,
        context,
        rawUniqueWhere,
        rawData
      );
      const { afterChange, data } = await resolveInputForCreateOrUpdate(
        listKey,
        'update',
        list,
        context,
        rawData,
        item,
        nestedMutationState.resolvers
      );
      return {
        handler: afterChange,
        operation: getPrismaModelForList(context.prisma, listKey).update({
          where: { id: item.id },
          data,
        }),
      };
    })
  );
  nestedMutationState.operations.push(...rootOperations);
  const items = await commitNestedMutation(nestedMutationState, context, provider);
  return items.slice(-rootOperations.length);
}

export async function updateOne(
  {
    where: rawUniqueWhere,
    data: rawData,
  }: { where: Record<string, any>; data: Record<string, any> },
  listKey: string,
  list: InitialisedList,
  context: KeystoneContext,
  provider: Provider
) {
  const item = await applyAccessControlForUpdate(listKey, list, context, rawUniqueWhere, rawData);
  const nestedMutationState = list.inputResolvers.createAndUpdate(context);
  const { afterChange, data } = await resolveInputForCreateOrUpdate(
    listKey,
    'create',
    list,
    context,
    rawData,
    item,
    nestedMutationState.resolvers
  );
  addToNestedMutationState(
    {
      handler: afterChange,
      operation: getPrismaModelForList(context.prisma, listKey).update({
        where: { id: item.id },
        data,
      }),
    },
    nestedMutationState
  );
  const results = await commitNestedMutation(nestedMutationState, context, provider);
  return results[results.length - 1];
}

export async function deleteMany(
  { ids }: { ids: string[] },
  listKey: string,
  list: InitialisedList,
  context: KeystoneContext
) {
  const result = await Promise.all(
    ids.map(async id => {
      const { id: parsedId } = await resolveUniqueWhereInput({ id }, list.fields, context);
      const { afterDelete, existingItem } = await processDelete(listKey, list, context, parsedId);
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
}

export async function deleteOne(
  { id }: { id: string },
  listKey: string,
  list: InitialisedList,
  context: KeystoneContext
) {
  const { id: parsedId } = await resolveUniqueWhereInput({ id }, list.fields, context);
  const { afterDelete } = await processDelete(listKey, list, context, parsedId);
  const item = await getPrismaModelForList(context.prisma, listKey).delete({
    where: { id: parsedId },
  });
  await afterDelete();
  return item;
}
