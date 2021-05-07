import { ItemRootValue, KeystoneContext, Provider } from '@keystone-next/types';
import {
  applyAccessControlForCreate,
  applyAccessControlForUpdate,
  processDelete,
  resolveInputForCreateOrUpdate,
  resolveUniqueWhereInput,
  UniquePrismaFilter,
} from './input-resolvers';
import { InitialisedList } from './types-for-lists';
import { getPrismaModelForList } from './utils';

async function prismaCreateMany(
  data: { where: UniquePrismaFilter; data: Record<string, any> }[],
  context: KeystoneContext,
  listKey: string,
  provider: Provider
) {
  const model = getPrismaModelForList(context.prisma, listKey);
  if (provider === 'sqlite') {
    let results: ItemRootValue[] = [];
    for (const individualData of data) {
      results.push(await model.create({ data: individualData }));
    }
    return results;
  } else {
    return context.prisma.$transaction(data.map(data => model.create({ data })));
  }
}

export async function createMany(
  { data }: { data: { data: Record<string, any> }[] },
  listKey: string,
  list: InitialisedList,
  context: KeystoneContext,
  provider: Provider
) {
  const inputs = await Promise.all(
    data.map(async ({ data: rawData }) => {
      await applyAccessControlForCreate(listKey, list, context, rawData);
      return resolveInputForCreateOrUpdate(listKey, 'create', list, context, rawData, undefined);
    })
  );

  const items = await prismaCreateMany(
    inputs.map(x => x.data),
    context,
    listKey,
    provider
  );
  await Promise.all(inputs.map((x, i) => x.afterChange(items[i])));
  return items;
}

export async function createOne(
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
  const item = await getPrismaModelForList(context.prisma, listKey).create({
    data,
  });
  await afterChange(item);
  return item;
}

async function prismaUpdateMany(
  data: { where: UniquePrismaFilter; data: Record<string, any> }[],
  context: KeystoneContext,
  listKey: string,
  provider: Provider
) {
  const model = getPrismaModelForList(context.prisma, listKey);
  if (provider === 'sqlite') {
    let results: ItemRootValue[] = [];
    for (const stuff of data) {
      results.push(await model.update(stuff));
    }
    return results;
  } else {
    return context.prisma.$transaction(data.map(stuff => model.update(stuff)));
  }
}

export async function updateMany(
  { data }: { data: { where: Record<string, any>; data: Record<string, any> }[] },
  listKey: string,
  list: InitialisedList,
  context: KeystoneContext,
  provider: Provider
) {
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
        ...(await resolveInputForCreateOrUpdate(listKey, 'update', list, context, rawData, item)),
      };
    })
  );
  const updatedItems = await prismaUpdateMany(things, context, listKey, provider);
  await Promise.all(things.map((x, index) => x.afterChange(updatedItems[index])));
  return updatedItems;
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
