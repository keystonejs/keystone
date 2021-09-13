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
  accessFilters: boolean | InputFilter
) {
  if (accessFilters === false) {
    // Early exit if they want to exclude everything
    throw accessDeniedError();
  }

  // Merge the filter access control and try to get the item.
  let where = mapUniqueWhereToWhere(list, uniqueWhere);
  if (typeof accessFilters === 'object') {
    where = { AND: [where, await resolveWhereInput(accessFilters, list, context)] };
  }
  const item = await runWithPrisma(context, list, model => model.findFirst({ where }));
  if (item === null) {
    throw accessDeniedError();
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
  const item = await getFilteredItem(list, context, uniqueWhere!, accessFilters);

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
    throw accessDeniedError();
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
  const item = await getFilteredItem(list, context, uniqueWhere!, accessFilters);

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
    throw accessDeniedError();
  }

  // Field level 'item' access control
  const results = await Promise.all(
    Object.keys(originalInput!).map(fieldKey =>
      validateFieldAccessControl({
        access: list.fields[fieldKey].access[operation],
        args: { ...args, fieldKey },
      })
    )
  );

  if (results.some(canAccess => !canAccess)) {
    throw accessDeniedError();
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
    throw accessDeniedError();
  }

  // Field level 'item' access control
  const results = await Promise.all(
    Object.keys(originalInput!).map(fieldKey =>
      validateFieldAccessControl({
        access: list.fields[fieldKey].access[operation],
        args: { ...args, fieldKey },
      })
    )
  );

  if (results.some(canAccess => !canAccess)) {
    throw accessDeniedError();
  }
}
