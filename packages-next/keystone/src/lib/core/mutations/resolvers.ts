import { KeystoneContext, DatabaseProvider, ItemRootValue } from '@keystone-next/types';
import pLimit from 'p-limit';
import {
  validateCreateListAccessControl,
  validateFieldAccessControl,
  validateNonCreateListAccessControl,
} from '../access-control';
import { accessDeniedError, ValidationFailureError } from '../graphql-errors';
import {
  InputFilter,
  PrismaFilter,
  resolveUniqueWhereInput,
  resolveWhereInput,
  UniqueInputFilter,
} from '../where-inputs';
import { ResolvedDBField } from '../resolve-relationships';
import { mapUniqueWhereToWhere } from '../queries/resolvers';
import { InitialisedList } from '../types-for-lists';
import {
  getPrismaModelForList,
  promiseAllRejectWithAllErrors,
  getDBFieldKeyForFieldOnMultiField,
} from '../utils';
import {
  NestedMutationState,
  resolveRelateToManyForCreateInput,
  resolveRelateToManyForUpdateInput,
  resolveRelateToOneForCreateInput,
  resolveRelateToOneForUpdateInput,
} from './nested-mutation-input-resolvers';

export function createMany(
  { data }: { data: Record<string, any>[] },
  list: InitialisedList,
  context: KeystoneContext,
  provider: DatabaseProvider
) {
  const writeLimit = pLimit(provider === 'sqlite' ? 1 : Infinity);
  return data.map(async rawData => {
    const { afterChange, data } = await createOneState({ data: rawData }, list, context);
    const item = await writeLimit(() =>
      getPrismaModelForList(context.prisma, list.listKey).create({ data })
    );
    await afterChange(item);
    return item;
  });
}

export async function createOneState(
  { data: rawData }: { data: Record<string, any> },
  list: InitialisedList,
  context: KeystoneContext
) {
  await applyAccessControlForCreate(list, context, rawData);
  const { data, afterChange } = await resolveInputForCreateOrUpdate(
    list,
    context,
    rawData,
    undefined
  );
  return {
    data,
    afterChange,
  };
}

export async function createOne(
  args: { data: Record<string, any> },
  list: InitialisedList,
  context: KeystoneContext
) {
  const { afterChange, data } = await createOneState(args, list, context);
  const item = await getPrismaModelForList(context.prisma, list.listKey).create({ data });
  await afterChange(item);
  return item;
}

export function updateMany(
  { data }: { data: { where: Record<string, any>; data: Record<string, any> }[] },
  list: InitialisedList,
  context: KeystoneContext,
  provider: DatabaseProvider
) {
  const writeLimit = pLimit(provider === 'sqlite' ? 1 : Infinity);
  return data.map(async ({ data: rawData, where: rawUniqueWhere }) => {
    const item = await applyAccessControlForUpdate(list, context, rawUniqueWhere, rawData);
    const { afterChange, data } = await resolveInputForCreateOrUpdate(list, context, rawData, item);
    const updatedItem = await writeLimit(() =>
      getPrismaModelForList(context.prisma, list.listKey).update({
        where: { id: item.id },
        data,
      })
    );
    afterChange(updatedItem);
    return updatedItem;
  });
}

export async function updateOne(
  {
    where: rawUniqueWhere,
    data: rawData,
  }: { where: Record<string, any>; data: Record<string, any> },
  list: InitialisedList,
  context: KeystoneContext
) {
  const item = await applyAccessControlForUpdate(list, context, rawUniqueWhere, rawData);
  const { afterChange, data } = await resolveInputForCreateOrUpdate(list, context, rawData, item);

  const updatedItem = await getPrismaModelForList(context.prisma, list.listKey).update({
    where: { id: item.id },
    data,
  });

  await afterChange(updatedItem);

  return updatedItem;
}

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

async function applyAccessControlForUpdate(
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

async function applyAccessControlForCreate(
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

export async function processDelete(
  list: InitialisedList,
  context: KeystoneContext,
  filter: UniqueInputFilter
) {
  const itemId = await getStringifiedItemIdFromUniqueWhereInput(filter, list.listKey, context);
  const access = await validateNonCreateListAccessControl({
    access: list.access.delete,
    args: { context, listKey: list.listKey, operation: 'delete', session: context.session, itemId },
  });
  const existingItem = await getAccessControlledItemForDelete(list, context, access, filter);

  const hookArgs = { operation: 'delete' as const, listKey: list.listKey, context, existingItem };
  await validationHook(list.listKey, 'delete', undefined, async addValidationError => {
    await promiseAllRejectWithAllErrors(
      Object.entries(list.fields).map(async ([fieldKey, field]) => {
        await field.hooks.validateDelete?.({
          ...hookArgs,
          addValidationError,
          fieldPath: fieldKey,
        });
      })
    );
  });

  await validationHook(list.listKey, 'delete', undefined, async addValidationError => {
    await list.hooks.validateDelete?.({ ...hookArgs, addValidationError });
  });

  await runSideEffectOnlyHook(list, 'beforeDelete', hookArgs, () => true);
  return {
    existingItem,
    afterDelete: async () => {
      await runSideEffectOnlyHook(list, 'afterDelete', hookArgs, () => true);
    },
  };
}

async function resolveInputForCreateOrUpdate(
  list: InitialisedList,
  context: KeystoneContext,
  originalInput: Record<string, any>,
  existingItem: Record<string, any> | undefined
) {
  const operation: 'create' | 'update' = existingItem === undefined ? 'create' : 'update';
  const nestedMutationState = new NestedMutationState(context);
  let resolvedData = Object.fromEntries(
    await promiseAllRejectWithAllErrors(
      Object.entries(list.fields).map(async ([fieldKey, field]) => {
        const inputConfig = field.input?.[operation];
        let input = originalInput[fieldKey];
        if (
          operation === 'create' &&
          input === undefined &&
          field.__legacy?.defaultValue !== undefined
        ) {
          input =
            typeof field.__legacy.defaultValue === 'function'
              ? await field.__legacy.defaultValue({ originalInput, context })
              : field.__legacy.defaultValue;
        }
        const resolved = inputConfig?.resolve
          ? await inputConfig.resolve(
              input,
              context,
              (() => {
                if (field.dbField.kind !== 'relation') {
                  return undefined as any;
                }
                const target = `${list.listKey}.${fieldKey}<${field.dbField.list}>`;
                const foreignList = list.lists[field.dbField.list];
                if (field.dbField.mode === 'many') {
                  if (operation === 'create') {
                    return resolveRelateToManyForCreateInput(
                      nestedMutationState,
                      context,
                      foreignList,
                      target
                    );
                  }
                  return resolveRelateToManyForUpdateInput(
                    nestedMutationState,
                    context,
                    foreignList,
                    target
                  );
                }
                if (operation === 'create') {
                  return resolveRelateToOneForCreateInput(
                    nestedMutationState,
                    context,
                    foreignList,
                    target
                  );
                }
                return resolveRelateToOneForUpdateInput(
                  nestedMutationState,
                  context,
                  foreignList,
                  target
                );
              })()
            )
          : input;
        return [fieldKey, resolved] as const;
      })
    )
  );

  resolvedData = await resolveInputHook(
    list,
    context,
    operation,
    resolvedData,
    originalInput,
    existingItem
  );

  await validationHook(list.listKey, operation, originalInput, addValidationError => {
    for (const [fieldKey, field] of Object.entries(list.fields)) {
      // yes, this is a massive hack, it's just to make image and file fields work well enough
      let val = resolvedData[fieldKey];
      if (field.dbField.kind === 'multi') {
        if (Object.values(resolvedData[fieldKey]).every(x => x === null)) {
          val = null;
        }
        if (Object.values(resolvedData[fieldKey]).every(x => x === undefined)) {
          val = undefined;
        }
      }
      if (
        field.__legacy?.isRequired &&
        ((operation === 'create' && val == null) || (operation === 'update' && val === null))
      ) {
        addValidationError(
          `Required field "${fieldKey}" is null or undefined.`,
          { resolvedData, operation, originalInput },
          {}
        );
      }
    }
  });

  const args = {
    context,
    listKey: list.listKey,
    operation,
    originalInput,
    resolvedData,
    existingItem,
  };
  await validationHook(list.listKey, operation, originalInput, async addValidationError => {
    await promiseAllRejectWithAllErrors(
      Object.entries(list.fields).map(async ([fieldKey, field]) => {
        await field.hooks.validateInput?.({
          ...args,
          addValidationError,
          fieldPath: fieldKey,
        });
      })
    );
  });

  await validationHook(list.listKey, operation, originalInput, async addValidationError => {
    await list.hooks.validateInput?.({ ...args, addValidationError });
  });
  const originalInputKeys = new Set(Object.keys(originalInput));
  const shouldCallFieldLevelSideEffectHook = (fieldKey: string) => originalInputKeys.has(fieldKey);
  await runSideEffectOnlyHook(list, 'beforeChange', args, shouldCallFieldLevelSideEffectHook);
  return {
    data: flattenMultiDbFields(list.fields, resolvedData),
    afterChange: async (updatedItem: ItemRootValue) => {
      await nestedMutationState.afterChange();
      await runSideEffectOnlyHook(
        list,
        'afterChange',
        { ...args, updatedItem, existingItem },
        shouldCallFieldLevelSideEffectHook
      );
    },
  };
}

function flattenMultiDbFields(
  fields: Record<string, { dbField: ResolvedDBField }>,
  data: Record<string, any>
) {
  return Object.fromEntries(
    Object.entries(data).flatMap(([fieldKey, value]) => {
      const { dbField } = fields[fieldKey];
      if (dbField.kind === 'multi') {
        return Object.entries(value).map(([innerFieldKey, fieldValue]) => {
          return [getDBFieldKeyForFieldOnMultiField(fieldKey, innerFieldKey), fieldValue];
        });
      }
      return [[fieldKey, value]];
    })
  );
}

async function resolveInputHook(
  list: InitialisedList,
  context: KeystoneContext,
  operation: 'create' | 'update',
  resolvedData: Record<string, any>,
  originalInput: Record<string, any>,
  existingItem: Record<string, any> | undefined
) {
  const args = {
    context,
    listKey: list.listKey,
    operation,
    originalInput,
    resolvedData,
    existingItem,
  };
  resolvedData = Object.fromEntries(
    await promiseAllRejectWithAllErrors(
      Object.entries(list.fields).map(async ([fieldKey, field]) => {
        if (field.hooks.resolveInput === undefined) {
          return [fieldKey, resolvedData[fieldKey]];
        }
        const value = await field.hooks.resolveInput({
          ...args,
          fieldPath: fieldKey,
        });
        return [fieldKey, value];
      })
    )
  );
  if (list.hooks.resolveInput) {
    // TODO: the resolveInput types are wrong
    resolvedData = (await list.hooks.resolveInput({
      ...args,
      resolvedData,
    })) as any;
  }
  return resolvedData;
}

async function runSideEffectOnlyHook<
  HookName extends string,
  List extends {
    fields: Record<
      string,
      {
        hooks: {
          [Key in HookName]?: (args: { fieldPath: string } & Args) => Promise<void> | void;
        };
      }
    >;
    hooks: {
      [Key in HookName]?: (args: any) => Promise<void> | void;
    };
  },
  Args extends Parameters<NonNullable<List['hooks'][HookName]>>[0]
>(
  list: List,
  hookName: HookName,
  args: Args,
  shouldRunFieldLevelHook: (fieldKey: string) => boolean
) {
  await promiseAllRejectWithAllErrors(
    Object.entries(list.fields).map(async ([fieldKey, field]) => {
      if (shouldRunFieldLevelHook(fieldKey)) {
        await field.hooks[hookName]?.({ fieldPath: fieldKey, ...args });
      }
    })
  );
  await list.hooks[hookName]?.(args);
}

type ValidationError = { msg: string; data: {}; internalData: {} };

type AddValidationError = (msg: string, data?: {}, internalData?: {}) => void;

async function validationHook(
  listKey: string,
  operation: 'create' | 'update' | 'delete',
  originalInput: Record<string, string> | undefined,
  validationHook: (addValidationError: AddValidationError) => void | Promise<void>
) {
  const errors: ValidationError[] = [];

  await validationHook((msg, data = {}, internalData = {}) => {
    errors.push({ msg, data, internalData });
  });

  if (errors.length) {
    throw new ValidationFailureError({
      data: {
        messages: errors.map(e => e.msg),
        errors: errors.map(e => e.data),
        listKey,
        operation,
      },
      internalData: { errors: errors.map(e => e.internalData), data: originalInput },
    });
  }
}

async function checkFieldAccessControlForUpdate(
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
          itemId: item.id,
        },
      });
    })
  );

  if (results.some(canAccess => !canAccess)) {
    throw accessDeniedError('mutation');
  }
}

async function getAccessControlledItemForDelete(
  list: InitialisedList,
  context: KeystoneContext,
  access: boolean | InputFilter,
  inputFilter: UniqueInputFilter
): Promise<ItemRootValue> {
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

async function getStringifiedItemIdFromUniqueWhereInput(
  uniqueWhere: UniqueInputFilter,
  listKey: string,
  context: KeystoneContext
): Promise<string> {
  return uniqueWhere.id !== undefined
    ? uniqueWhere.id
    : await (async () => {
        try {
          const item = await context.sudo().lists[listKey].findOne({ where: uniqueWhere as any });
          return item.id;
        } catch (err) {
          throw accessDeniedError('mutation');
        }
      })();
}
