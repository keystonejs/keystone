import pLimit, { Limit } from 'p-limit';
import { DatabaseProvider, KeystoneContext } from '../../../types';
import { getOperationAccess, getAccessFilters } from '../access-control';
import { checkFilterOrderAccess } from '../filter-order-access';
import { accessDeniedError } from '../graphql-errors';
import { InitialisedList } from '../types-for-lists';
import { runWithPrisma } from '../utils';
import { InputFilter, resolveUniqueWhereInput, UniqueInputFilter } from '../where-inputs';
import { getAccessControlledItemForDelete } from './access-control';
import { runSideEffectOnlyHook } from './hooks';
import { validateDelete } from './validation';

async function deleteSingle(
  uniqueInput: UniqueInputFilter,
  list: InitialisedList,
  context: KeystoneContext,
  accessFilters: boolean | InputFilter,
  operationAccess: boolean,
  writeLimit: Limit
) {
  // Operation level access control
  if (!operationAccess) {
    throw accessDeniedError(
      `You cannot perform the 'delete' operation on the list '${list.listKey}'.`
    );
  }

  // Validate and resolve the input filter
  const uniqueWhere = await resolveUniqueWhereInput(uniqueInput, list.fields, context);

  // Check filter access
  const fieldKey = Object.keys(uniqueWhere)[0];
  await checkFilterOrderAccess([{ fieldKey, list }], context, 'filter');

  // Filter and Item access control. Will throw an accessDeniedError if not allowed.
  const existingItem = await getAccessControlledItemForDelete(
    list,
    context,
    uniqueWhere,
    accessFilters
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

export async function deleteMany(
  uniqueInputs: UniqueInputFilter[],
  list: InitialisedList,
  context: KeystoneContext,
  provider: DatabaseProvider
) {
  const writeLimit = pLimit(provider === 'sqlite' ? 1 : Infinity);

  // Check operation permission to pass into single operation
  const operationAccess = await getOperationAccess(list, context, 'delete');

  // Check filter permission to pass into single operation
  const accessFilters = await getAccessFilters(list, context, 'delete');

  return uniqueInputs.map(async uniqueInput =>
    deleteSingle(uniqueInput, list, context, accessFilters, operationAccess, writeLimit)
  );
}

export async function deleteOne(
  uniqueInput: UniqueInputFilter,
  list: InitialisedList,
  context: KeystoneContext
) {
  // Check operation permission to pass into single operation
  const operationAccess = await getOperationAccess(list, context, 'delete');

  // Check filter permission to pass into single operation
  const accessFilters = await getAccessFilters(list, context, 'delete');

  return deleteSingle(uniqueInput, list, context, accessFilters, operationAccess, pLimit(1));
}
