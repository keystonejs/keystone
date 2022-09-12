import { KeystoneContext } from '../../../types';
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

export async function getAccessControlledItemForDelete(
  list: InitialisedList,
  context: KeystoneContext,
  uniqueWhere: UniquePrismaFilter,
  accessFilters: boolean | InputFilter
) {
  const operation = 'delete' as const;
  // Apply the filter access control. Will throw an accessDeniedError if the item isn't found.
  const item = await getFilteredItem(list, context, uniqueWhere!, accessFilters, operation);

  // Apply item level access control
  const access = list.access.item[operation];

  // List level 'item' access control
  let result: unknown; // should be boolean, but dont trust, it might accidentally be a filter
  try {
    result = await access({
      operation,
      session: context.session,
      listKey: list.listKey,
      context,
      item
    });
  } catch (error: any) {
    throw extensionError('Access control', [
      { error, tag: `${list.listKey}.access.item.${operation}` },
    ]);
  }

  // no field level access control for delete

  // short circuit the safe path
  if (result === true) return item;

  if (typeof result !== 'boolean') {
    throw accessReturnError([
      {
        tag: `${list.listKey}.access.item.${operation}`,
        returned: typeof result,
      },
    ]);
  }

  throw accessDeniedError(
    `You cannot perform the '${operation}' operation on the item '${JSON.stringify(
      uniqueWhere
    )}'. It may not exist.`
  );
}

export async function getAccessControlledItemForUpdate(
  list: InitialisedList,
  context: KeystoneContext,
  uniqueWhere: UniquePrismaFilter,
  accessFilters: boolean | InputFilter,
  inputData: Record<string, any>
) {
  const operation = 'update' as const;
  // Apply the filter access control. Will throw an accessDeniedError if the item isn't found.
  const item = await getFilteredItem(list, context, uniqueWhere!, accessFilters, operation);

  // Apply item level access control
  const access = list.access.item[operation];

  // List level 'item' access control
  let listResult: unknown; // should be boolean, but dont trust
  try {
    listResult = await access({
      operation,
      session: context.session,
      listKey: list.listKey,
      context,
      item,
      inputData,
    });
  } catch (error: any) {
    throw extensionError('Access control', [
      { error, tag: `${list.listKey}.access.item.${operation}` },
    ]);
  }

  // It's important that we don't cast objects to truthy values, as there's a strong chance that the user
  // has accidentally tried to return a filter.
  if (typeof listResult !== 'boolean') {
    throw accessReturnError([
      {
        tag: `${list.listKey}.access.item.${operation}`,
        returned: typeof listResult,
      },
    ]);
  }

  if (!listResult) {
    throw accessDeniedError(
      `You cannot perform the '${operation}' operation on the item '${JSON.stringify(
        uniqueWhere
      )}'. It may not exist.`
    );
  }

  // Field level 'item' access control
  const nonBooleans: { tag: string; returned: string }[] = [];
  const fieldsDenied: string[] = [];
  const accessErrors: { error: Error; tag: string }[] = [];

  await Promise.allSettled(
    Object.keys(inputData).map(async fieldKey => {
      const fieldAccessControl = list.fields[fieldKey].access[operation];

      let fieldResult: unknown; // should be boolean, but dont trust
      try {
        fieldResult = await fieldAccessControl({
          operation,
          session: context.session,
          listKey: list.listKey,
          fieldKey,
          context,
          item,
          inputData,
        });
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
        uniqueWhere
      )}'. You cannot ${operation} the fields ${JSON.stringify(fieldsDenied)}.`
    );
  }

  return item;
}

export async function applyAccessControlForCreate(
  list: InitialisedList,
  context: KeystoneContext,
  inputData: Record<string, unknown>
) {
  const operation = 'create' as const;

  // Apply item level access control
  const access = list.access.item[operation];

  // List level 'item' access control
  let listResult: unknown; // be conservative
  try {
    listResult = await access({
      operation,
      session: context.session,
      listKey: list.listKey,
      context,
      inputData,
    });
  } catch (error: any) {
    throw extensionError('Access control', [
      { error, tag: `${list.listKey}.access.item.${operation}` },
    ]);
  }

  // It's important that we don't cast objects to truthy values, as there's a strong chance that the user
  // has accidentally tried to return a filter.
  if (typeof listResult !== 'boolean') {
    throw accessReturnError([
      {
        tag: `${list.listKey}.access.item.${operation}`,
        returned: typeof listResult,
      },
    ]);
  }

  if (!listResult) {
    throw accessDeniedError(
      `You cannot perform the '${operation}' operation on the item '${JSON.stringify(inputData)}'.`
    );
  }

  // Field level 'item' access control
  const nonBooleans: { tag: string; returned: string }[] = [];
  const fieldsDenied: string[] = [];
  const accessErrors: { error: Error; tag: string }[] = [];

  await Promise.allSettled(
    Object.keys(inputData).map(async fieldKey => {
      const fieldAccessControl = list.fields[fieldKey].access[operation];

      let fieldResult: unknown; // should be boolean, but dont trust
      try {
        fieldResult = await fieldAccessControl({
          operation,
          session: context.session,
          listKey: list.listKey,
          fieldKey,
          context,
          inputData: inputData as any, // FIXME
        });
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
      )}'. You cannot ${operation} the fields ${JSON.stringify(fieldsDenied)}.`
    );
  }
}
