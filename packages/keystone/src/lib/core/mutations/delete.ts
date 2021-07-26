import { KeystoneContext, DatabaseProvider } from '@keystone-next/types';
import pLimit, { Limit } from 'p-limit';
import { InitialisedList } from '../types-for-lists';
import { runWithPrisma } from '../utils';
import { resolveUniqueWhereInput, UniqueInputFilter } from '../where-inputs';
import { getAccessControlledItemForDelete } from './access-control';
import { runSideEffectOnlyHook } from './hooks';
import { validateDelete } from './validation';

async function deleteSingle(
  uniqueInput: UniqueInputFilter,
  list: InitialisedList,
  context: KeystoneContext,
  writeLimit: Limit
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
  await runSideEffectOnlyHook(list, 'beforeDelete', hookArgs);

  const item = await writeLimit(() =>
    runWithPrisma(context, list, model => model.delete({ where: { id: existingItem.id } }))
  );

  await runSideEffectOnlyHook(list, 'afterDelete', hookArgs);

  return item;
}

export function deleteMany(
  uniqueInputs: UniqueInputFilter[],
  list: InitialisedList,
  context: KeystoneContext,
  provider: DatabaseProvider
) {
  const writeLimit = pLimit(provider === 'sqlite' ? 1 : Infinity);
  return uniqueInputs.map(async uniqueInput =>
    deleteSingle(uniqueInput, list, context, writeLimit)
  );
}

export async function deleteOne(
  uniqueInput: UniqueInputFilter,
  list: InitialisedList,
  context: KeystoneContext
) {
  return deleteSingle(uniqueInput, list, context, pLimit(1));
}
