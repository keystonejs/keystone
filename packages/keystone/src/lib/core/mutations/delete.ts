import { KeystoneContext, DatabaseProvider } from '@keystone-next/types';
import pLimit from 'p-limit';
import { InitialisedList } from '../types-for-lists';
import { getPrismaModelForList, promiseAllRejectWithAllErrors } from '../utils';
import { UniqueInputFilter, validateUniqueWhereInput } from '../where-inputs';
import { getAccessControlledItemForDelete } from './access-control';
import { runSideEffectOnlyHook, validationHook } from './hooks';

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
  validateUniqueWhereInput(uniqueInput);

  // Access control
  const existingItem = await getAccessControlledItemForDelete(list, context, uniqueInput);

  // Field validation
  const hookArgs = { operation: 'delete' as const, listKey: list.listKey, context, existingItem };
  await validationHook(list.listKey, 'delete', undefined, async addValidationError => {
    await promiseAllRejectWithAllErrors(
      Object.entries(list.fields).map(async ([fieldPath, field]) => {
        await field.hooks.validateDelete?.({ ...hookArgs, addValidationError, fieldPath });
      })
    );
  });

  // List validation
  await validationHook(list.listKey, 'delete', undefined, async addValidationError => {
    await list.hooks.validateDelete?.({ ...hookArgs, addValidationError });
  });

  // Before delete
  await runSideEffectOnlyHook(list, 'beforeDelete', hookArgs, () => true);

  return {
    existingItem,
    afterDelete: async () => {
      await runSideEffectOnlyHook(list, 'afterDelete', hookArgs, () => true);
    },
  };
}
