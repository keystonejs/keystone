import { ItemRootValue, KeystoneContext } from '@keystone-next/types';
import {
  validateCreateListAccessControl,
  validateFieldAccessControl,
  validateNonCreateListAccessControl,
} from '../access-control';
import { accessDeniedError } from '../graphql-errors';
import { mapUniqueWhereToWhere } from '../queries/resolvers';
import { InitialisedList } from '../types-for-lists';
import { getPrismaModelForList } from '../utils';
import {
  UniqueInputFilter,
  PrismaFilter,
  resolveUniqueWhereInput,
  resolveWhereInput,
} from '../where-inputs';

export async function getAccessControlledItemForDelete(
  list: InitialisedList,
  context: KeystoneContext,
  filter: UniqueInputFilter,
  inputFilter: UniqueInputFilter
): Promise<ItemRootValue> {
  const itemId = await getStringifiedItemIdFromUniqueWhereInput(filter, list.listKey, context);
  const access = await validateNonCreateListAccessControl({
    access: list.access.delete,
    args: { context, listKey: list.listKey, operation: 'delete', session: context.session, itemId },
  });
  if (access === false) {
    throw accessDeniedError('mutation');
  }
  const prismaModel = getPrismaModelForList(context.prisma, list.listKey);
  let where: PrismaFilter = mapUniqueWhereToWhere(
    list,
    await resolveUniqueWhereInput(inputFilter, list.fields, context)
  );
  if (typeof access === 'object') {
    where = { AND: [where, await resolveWhereInput(access, list)] };
  }
  const item = await prismaModel.findFirst({ where });
  if (item === null) {
    throw accessDeniedError('mutation');
  }
  return item;
}

export async function checkFieldAccessControlForUpdate(
  list: InitialisedList,
  context: KeystoneContext,
  originalInput: Record<string, any>,
  item: Record<string, any>
) {
  const results = await Promise.all(
    Object.keys(originalInput).map(fieldKey => {
      const field = list.fields[fieldKey];
      return validateFieldAccessControl({
        access: field.access.update,
        args: {
          context,
          fieldKey,
          listKey: list.listKey,
          operation: 'update',
          originalInput,
          session: context.session,
          item,
          itemId: item.id.toString(),
        },
      });
    })
  );

  if (results.some(canAccess => !canAccess)) {
    throw accessDeniedError('mutation');
  }
}

export async function getAccessControlledItemForUpdate(
  list: InitialisedList,
  context: KeystoneContext,
  uniqueWhere: UniqueInputFilter,
  update: Record<string, any>
) {
  const prismaModel = getPrismaModelForList(context.prisma, list.listKey);
  const resolvedUniqueWhere = await resolveUniqueWhereInput(uniqueWhere, list.fields, context);
  const itemId = await getStringifiedItemIdFromUniqueWhereInput(uniqueWhere, list.listKey, context);
  const accessControl = await validateNonCreateListAccessControl({
    access: list.access.update,
    args: {
      context,
      itemId,
      listKey: list.listKey,
      operation: 'update',
      originalInput: update,
      session: context.session,
    },
  });
  if (accessControl === false) {
    throw accessDeniedError('mutation');
  }
  const uniqueWhereInWhereForm = mapUniqueWhereToWhere(list, resolvedUniqueWhere);
  const item = await prismaModel.findFirst({
    where:
      accessControl === true
        ? uniqueWhereInWhereForm
        : {
            AND: [uniqueWhereInWhereForm, await resolveWhereInput(accessControl, list)],
          },
  });
  if (!item) {
    throw accessDeniedError('mutation');
  }
  await checkFieldAccessControlForUpdate(list, context, update, item);
  return item;
}

export async function applyAccessControlForCreate(
  list: InitialisedList,
  context: KeystoneContext,
  originalInput: Record<string, unknown>
) {
  const result = await validateCreateListAccessControl({
    access: list.access.create,
    args: {
      context,
      listKey: list.listKey,
      operation: 'create',
      originalInput,
      session: context.session,
    },
  });
  if (!result) {
    throw accessDeniedError('mutation');
  }
  await checkFieldAccessControlForCreate(list, context, originalInput);
}

async function checkFieldAccessControlForCreate(
  list: InitialisedList,
  context: KeystoneContext,
  originalInput: Record<string, any>
) {
  const results = await Promise.all(
    Object.keys(originalInput).map(fieldKey => {
      const field = list.fields[fieldKey];
      return validateFieldAccessControl({
        access: field.access.create,
        args: {
          context,
          fieldKey,
          listKey: list.listKey,
          operation: 'create',
          originalInput,
          session: context.session,
        },
      });
    })
  );

  if (results.some(canAccess => !canAccess)) {
    throw accessDeniedError('mutation');
  }
}

async function getStringifiedItemIdFromUniqueWhereInput(
  uniqueWhere: UniqueInputFilter,
  listKey: string,
  context: KeystoneContext
): Promise<string> {
  if (uniqueWhere.id !== undefined) {
    return uniqueWhere.id;
  }
  try {
    const item = await context.sudo().lists[listKey].findOne({ where: uniqueWhere as any });
    return item.id;
  } catch (err) {
    throw accessDeniedError('mutation');
  }
}
