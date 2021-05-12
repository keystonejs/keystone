import { KeystoneContext, DatabaseProvider } from '@keystone-next/types';
import {
  applyAccessControlForCreate,
  applyAccessControlForUpdate,
  processDelete,
  resolveInputForCreateOrUpdate,
  resolveUniqueWhereInput,
} from './input-resolvers';
import { runPrismaOperations, InitialisedList } from './types-for-lists';
import { getPrismaModelForList } from './utils';

export async function createMany(
  { data }: { data: { data: Record<string, any> }[] },
  listKey: string,
  list: InitialisedList,
  context: KeystoneContext,
  provider: DatabaseProvider
) {
  const rootOperations = await Promise.all(
    data.map(async args => {
      const { afterChange, data } = await createOneState(args, listKey, list, context);
      const operation = getPrismaModelForList(context.prisma, listKey).create({ data });
      return { afterChange, operation };
    })
  );
  const items = await runPrismaOperations(
    rootOperations.map(x => x.operation),
    context,
    provider
  );
  return items;
}

export async function createOneState(
  { data: rawData }: { data: Record<string, any> },
  listKey: string,
  list: InitialisedList,
  context: KeystoneContext
) {
  await applyAccessControlForCreate(listKey, list, context, rawData);
  const { data, afterChange } = await resolveInputForCreateOrUpdate(
    listKey,
    'create',
    list,
    context,
    rawData,
    undefined
  );
  return {
    data,
    afterChange,
  };
}

export async function createOne(
  args: { data: Record<string, any> },
  listKey: string,
  list: InitialisedList,
  context: KeystoneContext
) {
  const { afterChange, data } = await createOneState(args, listKey, list, context);
  const item = await getPrismaModelForList(context.prisma, listKey).create({ data });
  await afterChange(item);
  return item;
}

export async function updateMany(
  { data }: { data: { where: Record<string, any>; data: Record<string, any> }[] },
  listKey: string,
  list: InitialisedList,
  context: KeystoneContext,
  provider: DatabaseProvider
) {
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
        item
      );
      return {
        afterChange,
        operation: getPrismaModelForList(context.prisma, listKey).update({
          where: { id: item.id },
          data,
        }),
      };
    })
  );

  const items = await runPrismaOperations(
    rootOperations.map(x => x.operation),
    context,
    provider
  );

  await Promise.all(rootOperations.map((x, i) => x.afterChange(items[i])));

  return items;
}

export async function updateOne(
  {
    where: rawUniqueWhere,
    data: rawData,
  }: { where: Record<string, any>; data: Record<string, any> },
  listKey: string,
  list: InitialisedList,
  context: KeystoneContext
) {
  const item = await applyAccessControlForUpdate(listKey, list, context, rawUniqueWhere, rawData);
  const { afterChange, data } = await resolveInputForCreateOrUpdate(
    listKey,
    'update',
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
