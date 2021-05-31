import { KeystoneContext, DatabaseProvider } from '@keystone-next/types';
import pLimit from 'p-limit';
import {
  applyAccessControlForCreate,
  applyAccessControlForUpdate,
  processDelete,
  resolveInputForCreateOrUpdate,
  UniqueInputFilter,
} from './input-resolvers';
import { InitialisedList } from './types-for-lists';
import { getPrismaModelForList } from './utils';

export async function createMany(
  { data }: { data: Record<string, any>[] },
  list: InitialisedList,
  context: KeystoneContext,
  provider: DatabaseProvider
) {
  const writeLimit = pLimit(provider === 'sqlite' ? 1 : Infinity);
  return data.map(async rawData => {
    const { afterChange, data } = await createOneState({ data: rawData }, list, context);
    const item = await writeLimit(() =>
      getPrismaModelForList(context.prisma, list.listKey).create({ data })
    );
    await afterChange(item);
    return item;
  });
}

export async function createOneState(
  { data: rawData }: { data: Record<string, any> },
  list: InitialisedList,
  context: KeystoneContext
) {
  await applyAccessControlForCreate(list, context, rawData);
  const { data, afterChange } = await resolveInputForCreateOrUpdate(
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
  list: InitialisedList,
  context: KeystoneContext
) {
  const { afterChange, data } = await createOneState(args, list, context);
  const item = await getPrismaModelForList(context.prisma, list.listKey).create({ data });
  await afterChange(item);
  return item;
}

export async function updateMany(
  { data }: { data: { where: Record<string, any>; data: Record<string, any> }[] },
  list: InitialisedList,
  context: KeystoneContext,
  provider: DatabaseProvider
) {
  const writeLimit = pLimit(provider === 'sqlite' ? 1 : Infinity);
  return data.map(async ({ data: rawData, where: rawUniqueWhere }) => {
    const item = await applyAccessControlForUpdate(list, context, rawUniqueWhere, rawData);
    const { afterChange, data } = await resolveInputForCreateOrUpdate(list, context, rawData, item);
    const updatedItem = await writeLimit(() =>
      getPrismaModelForList(context.prisma, list.listKey).update({
        where: { id: item.id },
        data,
      })
    );
    afterChange(updatedItem);
    return updatedItem;
  });
}

export async function updateOne(
  {
    where: rawUniqueWhere,
    data: rawData,
  }: { where: Record<string, any>; data: Record<string, any> },
  list: InitialisedList,
  context: KeystoneContext
) {
  const item = await applyAccessControlForUpdate(list, context, rawUniqueWhere, rawData);
  const { afterChange, data } = await resolveInputForCreateOrUpdate(list, context, rawData, item);

  const updatedItem = await getPrismaModelForList(context.prisma, list.listKey).update({
    where: { id: item.id },
    data,
  });

  await afterChange(updatedItem);

  return updatedItem;
}

export async function deleteMany(
  { where }: { where: UniqueInputFilter[] },
  list: InitialisedList,
  context: KeystoneContext,
  provider: DatabaseProvider
) {
  const writeLimit = pLimit(provider === 'sqlite' ? 1 : Infinity);
  return where.map(async where => {
    const { afterDelete, existingItem } = await processDelete(list, context, where);
    await writeLimit(() =>
      getPrismaModelForList(context.prisma, list.listKey).delete({
        where: { id: existingItem.id },
      })
    );
    afterDelete();
    return existingItem;
  });
}

export async function deleteOne(
  { where }: { where: UniqueInputFilter },
  list: InitialisedList,
  context: KeystoneContext
) {
  const { afterDelete, existingItem } = await processDelete(list, context, where);
  const item = await getPrismaModelForList(context.prisma, list.listKey).delete({
    where: { id: existingItem.id },
  });
  await afterDelete();
  return item;
}
