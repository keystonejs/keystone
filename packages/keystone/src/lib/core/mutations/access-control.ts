import { ItemRootValue, KeystoneContext } from '@keystone-next/types';
import {
  validateCreateListAccessControl,
  validateFieldAccessControl,
  validateNonCreateListAccessControl,
} from '../access-control';
import { accessDeniedError } from '../graphql-errors';
import { mapUniqueWhereToWhere } from '../queries/resolvers';
import { InitialisedList } from '../types-for-lists';
import { runWithPrisma } from '../utils';
import {
  UniqueInputFilter,
  PrismaFilter,
  resolveWhereInput,
  UniquePrismaFilter,
} from '../where-inputs';

export async function getAccessControlledItemForDelete(
  list: InitialisedList,
  context: KeystoneContext,
  uniqueInput: UniqueInputFilter,
  uniqueWhere: UniquePrismaFilter
): Promise<ItemRootValue> {
  const itemId = await getStringifiedItemIdFromUniqueWhereInput(uniqueInput, list.listKey, context);

  // List access: pass 1
  const access = await validateNonCreateListAccessControl({
    access: list.access.delete,
    args: { context, listKey: list.listKey, operation: 'delete', session: context.session, itemId },
  });
  if (access === false) {
    throw accessDeniedError('mutation');
  }

  // List access: pass 2
  let where: PrismaFilter = mapUniqueWhereToWhere(list, uniqueWhere);
  if (typeof access === 'object') {
    where = { AND: [where, await resolveWhereInput(access, list)] };
  }
  const item = await runWithPrisma(context, list, model => model.findFirst({ where }));
  if (item === null) {
    throw accessDeniedError('mutation');
  }

  return item;
}

export async function getAccessControlledItemForUpdate(
  list: InitialisedList,
  context: KeystoneContext,
  uniqueInput: UniqueInputFilter,
  uniqueWhere: UniquePrismaFilter,
  update: Record<string, any>
) {
  const itemId = await getStringifiedItemIdFromUniqueWhereInput(uniqueInput, list.listKey, context);
  const args = {
    context,
    itemId,
    listKey: list.listKey,
    operation: 'update' as const,
    originalInput: update,
    session: context.session,
  };

  // List access: pass 1
  const accessControl = await validateNonCreateListAccessControl({
    access: list.access.update,
    args,
  });
  if (accessControl === false) {
    throw accessDeniedError('mutation');
  }

  // List access: pass 2
  const uniqueWhereInWhereForm = mapUniqueWhereToWhere(list, uniqueWhere);
  const item = await runWithPrisma(context, list, async model =>
    model.findFirst({
      where:
        accessControl === true
          ? uniqueWhereInWhereForm
          : { AND: [uniqueWhereInWhereForm, await resolveWhereInput(accessControl, list)] },
    })
  );
  if (!item) {
    throw accessDeniedError('mutation');
  }

  // Field access
  const results = await Promise.all(
    Object.keys(update).map(fieldKey => {
      const field = list.fields[fieldKey];
      return validateFieldAccessControl({
        access: field.access.update,
        args: { ...args, fieldKey, item },
      });
    })
  );

  if (results.some(canAccess => !canAccess)) {
    throw accessDeniedError('mutation');
  }

  return item;
}

export async function applyAccessControlForCreate(
  list: InitialisedList,
  context: KeystoneContext,
  originalInput: Record<string, unknown>
) {
  const args = {
    context,
    listKey: list.listKey,
    operation: 'create' as const,
    originalInput,
    session: context.session,
  };

  // List access
  const result = await validateCreateListAccessControl({ access: list.access.create, args });
  if (!result) {
    throw accessDeniedError('mutation');
  }

  // Field access
  const results = await Promise.all(
    Object.keys(originalInput).map(fieldKey => {
      const field = list.fields[fieldKey];
      return validateFieldAccessControl({
        access: field.access.create,
        args: { fieldKey, ...args },
      });
    })
  );

  if (results.some(canAccess => !canAccess)) {
    throw accessDeniedError('mutation');
  }
}

async function getStringifiedItemIdFromUniqueWhereInput(
  uniqueInput: UniqueInputFilter,
  listKey: string,
  context: KeystoneContext
): Promise<string> {
  if (uniqueInput.id !== undefined) {
    return uniqueInput.id;
  }
  try {
    const item = await context.sudo().lists[listKey].findOne({ where: uniqueInput });
    return item.id;
  } catch (err) {
    throw accessDeniedError('mutation');
  }
}
