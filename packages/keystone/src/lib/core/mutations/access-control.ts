import { KeystoneContext } from '../../../types';
import { validateFieldAccessControl } from '../access-control';
import { accessDeniedError } from '../graphql-errors';
import { mapUniqueWhereToWhere } from '../queries/resolvers';
import { InitialisedList } from '../types-for-lists';
import { runWithPrisma } from '../utils';
import { InputFilter, resolveWhereInput, UniquePrismaFilter } from '../where-inputs';

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
  let where = mapUniqueWhereToWhere(list, uniqueWhere);
  if (typeof accessFilters === 'object') {
    where = { AND: [where, await resolveWhereInput(accessFilters, list, context)] };
  }
  const item = await runWithPrisma(context, list, model => model.findFirst({ where }));
  if (item === null) {
    throw accessDeniedError(
      `You cannot perform the '${operation}' operation on the item '${JSON.stringify(
        uniqueWhere
      )}'. It may not exist.`
    );
  }

  return item;
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
  const args = { operation, session: context.session, listKey: list.listKey, context, item };

  // List level 'item' access control
  const result = await access(args);
  const resultType = typeof result;

  // It's important that we don't cast objects to truthy values, as there's a strong chance that the user
  // has accidentally tried to return a filter.
  if (resultType !== 'boolean') {
    throw new Error(
      `Must return a Boolean from ${args.listKey}.access.item.${operation}(). Got ${resultType}`
    );
  }

  if (!result) {
    throw accessDeniedError(
      `You cannot perform the '${operation}' operation on the item '${JSON.stringify(
        uniqueWhere
      )}'. It may not exist.`
    );
  }

  // No field level access control for delete

  return item;
}

export async function getAccessControlledItemForUpdate(
  list: InitialisedList,
  context: KeystoneContext,
  uniqueWhere: UniquePrismaFilter,
  accessFilters: boolean | InputFilter,
  originalInput: Record<string, any>
) {
  const operation = 'update' as const;
  // Apply the filter access control. Will throw an accessDeniedError if the item isn't found.
  const item = await getFilteredItem(list, context, uniqueWhere!, accessFilters, operation);

  // Apply item level access control
  const access = list.access.item[operation];
  const args = {
    operation,
    session: context.session,
    listKey: list.listKey,
    context,
    item,
    originalInput,
  };

  // List level 'item' access control
  const result = await access(args);
  const resultType = typeof result;

  // It's important that we don't cast objects to truthy values, as there's a strong chance that the user
  // has accidentally tried to return a filter.
  if (resultType !== 'boolean') {
    throw new Error(
      `Must return a Boolean from ${args.listKey}.access.item.${operation}(). Got ${resultType}`
    );
  }

  if (!result) {
    throw accessDeniedError(
      `You cannot perform the '${operation}' operation on the item '${JSON.stringify(
        uniqueWhere
      )}'. It may not exist.`
    );
  }

  // Field level 'item' access control
  const fieldsDenied = (
    await Promise.all(
      Object.keys(originalInput!).map(async fieldKey => [
        fieldKey,
        await validateFieldAccessControl({
          access: list.fields[fieldKey].access[operation],
          args: { ...args, fieldKey },
        }),
      ])
    )
  ) // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, result]) => !result)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(([fieldKey, _]) => fieldKey);

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
  originalInput: Record<string, unknown>
) {
  const operation = 'create' as const;

  // Apply item level access control
  const access = list.access.item[operation];
  const args = {
    operation,
    session: context.session,
    listKey: list.listKey,
    context,
    originalInput,
  };

  // List level 'item' access control
  const result = await access(args);
  const resultType = typeof result;

  // It's important that we don't cast objects to truthy values, as there's a strong chance that the user
  // has accidentally tried to return a filter.
  if (resultType !== 'boolean') {
    throw new Error(
      `Must return a Boolean from ${args.listKey}.access.item.${operation}(). Got ${resultType}`
    );
  }

  if (!result) {
    throw accessDeniedError(
      `You cannot perform the '${operation}' operation on the item '${JSON.stringify(
        originalInput
      )}'.`
    );
  }

  // Field level 'item' access control

  const fieldsDenied = (
    await Promise.all(
      Object.keys(originalInput!).map(async fieldKey => [
        fieldKey,
        await validateFieldAccessControl({
          access: list.fields[fieldKey].access[operation],
          args: { ...args, fieldKey },
        }),
      ])
    )
  ) // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, result]) => !result)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(([fieldKey, _]) => fieldKey);

  if (fieldsDenied.length) {
    throw accessDeniedError(
      `You cannot perform the '${operation}' operation on the item '${JSON.stringify(
        originalInput
      )}'. You cannot ${operation} the fields ${JSON.stringify(fieldsDenied)}.`
    );
  }
}
