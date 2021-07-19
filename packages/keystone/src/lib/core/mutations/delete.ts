import { KeystoneContext, DatabaseProvider } from '@keystone-next/types';
import pLimit from 'p-limit';
import { InitialisedList } from '../types-for-lists';
import { getPrismaModelForList } from '../utils';
import { resolveUniqueWhereInput, UniqueInputFilter } from '../where-inputs';
import { getAccessControlledItemForDelete } from './access-control';
import { runSideEffectOnlyHook } from './hooks';
import { validateDelete } from './validation';

export function deleteMany(
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

async function processDelete(
  list: InitialisedList,
  context: KeystoneContext,
  uniqueInput: UniqueInputFilter
) {
  // Validate and resolve the input filter
  const uniqueWhere = await resolveUniqueWhereInput(uniqueInput, list.fields, context);
  // Access control
  const existingItem = await getAccessControlledItemForDelete(
    list,
    context,
    uniqueInput,
    uniqueWhere
  );

  const hookArgs = { operation: 'delete' as const, listKey: list.listKey, context, existingItem };

  // Apply all validation checks
  await validateDelete({ list, hookArgs });

  // Before delete
  await runSideEffectOnlyHook(list, 'beforeDelete', hookArgs, () => true);

  return {
    existingItem,
    afterDelete: async () => {
      await runSideEffectOnlyHook(list, 'afterDelete', hookArgs, () => true);
    },
  };
}
