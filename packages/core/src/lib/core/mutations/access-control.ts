import { BaseItem, KeystoneContext } from '../../../types';
import { accessDeniedError, accessReturnError, extensionError } from '../graphql-errors';
import { mapUniqueWhereToWhere } from '../queries/resolvers';
import { InitialisedList } from '../types-for-lists';
import { runWithPrisma } from '../utils';
import {
  InputFilter,
  resolveUniqueWhereInput,
  resolveWhereInput,
  UniqueInputFilter,
  UniquePrismaFilter,
} from '../where-inputs';

const missingItem = (operation: string, uniqueWhere: UniquePrismaFilter) =>
  accessDeniedError(
    `You cannot perform the '${operation}' operation on the item '${JSON.stringify(
      uniqueWhere
    )}'. It may not exist.`
  );

async function getFilteredItem(
  list: InitialisedList,
  context: KeystoneContext,
  uniqueWhere: UniquePrismaFilter,
  accessFilters: boolean | InputFilter,
  operation: 'update' | 'delete'
) {
  if (accessFilters === false) {
    // Early exit if they want to exclude everything
    throw accessDeniedError(
      `You cannot perform the '${operation}' operation on the list '${list.listKey}'.`
    );
  }

  // Merge the filter access control and try to get the item.
  let where = mapUniqueWhereToWhere(uniqueWhere);
  if (typeof accessFilters === 'object') {
    where = { AND: [where, await resolveWhereInput(accessFilters, list, context)] };
  }
  const item = await runWithPrisma(context, list, model => model.findFirst({ where }));
  if (item !== null) return item;

  throw missingItem(operation, uniqueWhere);
}

export async function checkUniqueItemExists(
  uniqueInput: UniqueInputFilter,
  foreignList: InitialisedList,
  context: KeystoneContext,
  operation: string
) {
  // Validate and resolve the input filter
  const uniqueWhere = await resolveUniqueWhereInput(uniqueInput, foreignList, context);
  // Check whether the item exists (from this users POV).
  try {
    const item = await context.db[foreignList.listKey].findOne({ where: uniqueInput });
    if (item === null) {
      throw missingItem(operation, uniqueWhere);
    }
  } catch (err) {
    throw missingItem(operation, uniqueWhere);
  }
  return uniqueWhere;
}

async function enforceListLevelAccessControl ({
  context,
  operation,
  list,
  item,
  inputData,
}: {
  context: KeystoneContext,
  operation: 'create' | 'update' | 'delete'
  list: InitialisedList,
  item: BaseItem | undefined,
  inputData: Record<string, unknown>
}) {
  // List level 'item' access control
  let listResult: unknown; // should be boolean, but dont trust, it might accidentally be a filter
  try {
    if (operation === 'create') {
      const listAccessControl = list.access.item[operation];
      listResult = await listAccessControl({
        operation,
        session: context.session,
        listKey: list.listKey,
        context,
        inputData,
      });
    } else if (operation === 'update' && item !== undefined) {
      const listAccessControl = list.access.item[operation];
      listResult = await listAccessControl({
        operation,
        session: context.session,
        listKey: list.listKey,
        context,
        item,
        inputData,
      });
    } else if (operation === 'delete' && item !== undefined) {
      const listAccessControl = list.access.item[operation];
      listResult = await listAccessControl({
        operation,
        session: context.session,
        listKey: list.listKey,
        context,
        item,
      });
    }
  } catch (error: any) {
    throw extensionError('Access control', [
      { error, tag: `${list.listKey}.access.item.${operation}` },
    ]);
  }

  // short circuit the safe path
  if (listResult === true) return;

  if (typeof listResult !== 'boolean') {
    throw accessReturnError([
      {
        tag: `${list.listKey}.access.item.${operation}`,
        returned: typeof listResult,
      },
    ]);
  }

  throw accessDeniedError(
    `You cannot perform the '${operation}' operation on the item '${JSON.stringify(
      inputData
    )}'. It may not exist.`
  );
}

async function enforceFieldLevelAccessControl ({
  context,
  operation,
  list,
  item,
  inputData,
}: {
  context: KeystoneContext,
  operation: 'create' | 'update'
  list: InitialisedList,
  item: BaseItem | undefined,
  inputData: Record<string, unknown>
}) {
  const nonBooleans: { tag: string; returned: string }[] = [];
  const fieldsDenied: string[] = [];
  const accessErrors: { error: Error; tag: string }[] = [];

  await Promise.allSettled(
    Object.keys(inputData).map(async fieldKey => {
      let fieldResult: unknown; // should be boolean, but dont trust
      try {
        if (operation === 'create') {
          const fieldAccessControl = list.fields[fieldKey].access[operation];
          fieldResult = await fieldAccessControl({
            operation,
            session: context.session,
            listKey: list.listKey,
            fieldKey,
            context,
            inputData: inputData as any, // FIXME
          });
        } else if (operation === 'update' && item !== undefined) {
          const fieldAccessControl = list.fields[fieldKey].access[operation];
          fieldResult = await fieldAccessControl({
            operation,
            session: context.session,
            listKey: list.listKey,
            fieldKey,
            context,
            item,
            inputData,
          });
        }
      } catch (error: any) {
        accessErrors.push({ error, tag: `${list.listKey}.${fieldKey}.access.${operation}` });
        return;
      }

      // short circuit the safe path
      if (fieldResult === true) return;
      fieldsDenied.push(fieldKey);

      // wrong type?
      if (typeof fieldResult !== 'boolean') {
        nonBooleans.push({
          tag: `${list.listKey}.${fieldKey}.access.${operation}`,
          returned: typeof fieldResult,
        });
      }
    })
  );

  if (nonBooleans.length) {
    throw accessReturnError(nonBooleans);
  }

  if (accessErrors.length) {
    throw extensionError('Access control', accessErrors);
  }

  if (fieldsDenied.length) {
    throw accessDeniedError(
      `You cannot perform the '${operation}' operation on the item '${JSON.stringify(
        inputData
      )}'. You cannot '${operation}' the fields ${JSON.stringify(fieldsDenied)}.`
    );
  }
}

export async function getAccessControlledItemForUpdate(
  list: InitialisedList,
  context: KeystoneContext,
  uniqueWhere: UniquePrismaFilter,
  accessFilters: boolean | InputFilter,
  inputData: Record<string, any>
) {
  // apply filter access control - throws accessDeniedError on item not found
  const item = await getFilteredItem(list, context, uniqueWhere!, accessFilters, 'update');

  await enforceListLevelAccessControl({
    context,
    operation: 'update',
    list,
    inputData,
    item
  });

  await enforceFieldLevelAccessControl({
    context,
    operation: 'update',
    list,
    inputData,
    item
  });

  return item;
}

export async function applyAccessControlForCreate(
  list: InitialisedList,
  context: KeystoneContext,
  inputData: Record<string, unknown>
) {
  await enforceListLevelAccessControl({
    context,
    operation: 'create',
    list,
    inputData,
    item: undefined
  });

  await enforceFieldLevelAccessControl({
    context,
    operation: 'create',
    list,
    inputData,
    item: undefined
  });
}

export async function getAccessControlledItemForDelete(
  list: InitialisedList,
  context: KeystoneContext,
  uniqueWhere: UniquePrismaFilter,
  accessFilters: boolean | InputFilter
) {
  // apply filter access control - throws accessDeniedError on item not found
  const item = await getFilteredItem(list, context, uniqueWhere!, accessFilters, 'delete');

  await enforceListLevelAccessControl({
    context,
    operation: 'delete',
    list,
    item,
    inputData: {}
  });

  // no field level access control for delete

  return item;
}
