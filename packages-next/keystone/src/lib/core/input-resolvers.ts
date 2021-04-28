import { ItemRootValue, KeystoneContext, NextFieldType } from '@keystone-next/types';
import {
  validateCreateListAccessControl,
  validateFieldAccessControl,
} from '../context/createAccessControlContext';
import { validateNonCreateListAccessControl } from '../context/createAccessControlContext';
import { mapUniqueWhereToWhere } from './query-resolvers';
import {
  accessDeniedError,
  throwAccessDenied,
  ValidationFailureError,
} from './ListTypes/graphqlErrors';
import { getDBFieldPathForFieldOnMultiField, ResolvedDBField } from './prisma-schema';
import { InitialisedList } from './types-for-lists';
import { getPrismaModelForList, IdType } from './utils';

// this is wrong, what is being enforcing with this should be enforced by using generics
export type InputFilter = Record<string, any> & {
  _____?: 'input filter';
  AND?: InputFilter[];
  OR?: InputFilter[];
  NOT?: InputFilter[];
};
export type PrismaFilter = Record<string, any> & {
  _____?: 'prisma filter';
  AND?: PrismaFilter[];
  OR?: PrismaFilter[];
  NOT?: PrismaFilter[];
};

export type UniqueInputFilter = Record<string, any> & { _____?: 'unique input filter' };
export type UniquePrismaFilter = Record<string, any> & { _____?: 'unique prisma filter' };

export type CreateItemInput = Record<string, any> & { _____?: 'unique input filter' };
export type ResolvedCreateItemInput = Record<string, any> & { _____?: 'unique prisma filter' };

function nestWithAppropiateField(
  fieldKey: string,
  dbField: ResolvedDBField,
  value: Record<string, any>
) {
  if (dbField.kind !== 'multi') {
    return { [fieldKey]: value };
  }
  Object.fromEntries(
    Object.entries(value).map(([key, val]) => [
      getDBFieldPathForFieldOnMultiField(fieldKey, key),
      val,
    ])
  );
}

export type InputResolvers = {
  where: (where: InputFilter) => Promise<PrismaFilter>;
  uniqueWhere: (where: UniqueInputFilter) => Promise<UniquePrismaFilter>;
  // create: (args: { where: UniquePrismaFilter }) => Promise<{ updateUniqueInputFilter }>;
};

export async function resolveWhereInput(
  inputFilter: InputFilter,
  fields: Record<
    string,
    // i am intentionally only passing in specific things to make it clear this function cares about nothing else
    {
      dbField: ResolvedDBField;
      input?: {
        where?: NonNullable<NonNullable<NextFieldType['input']>['where']>;
      };
    }
  >
): Promise<PrismaFilter> {
  return {
    AND: await Promise.all(
      Object.entries(inputFilter).map(async ([fieldKey, value]) => {
        if (fieldKey === 'OR' || fieldKey === 'AND' || fieldKey === 'NOT') {
          return {
            [fieldKey]: await Promise.all(
              value.map((value: any) => resolveWhereInput(value, fields))
            ),
          };
        }
        const field = fields[fieldKey];
        // we know if there are filters in the input object with the key of a field, the field must have defined a where input so this non null assertion is okay
        const where = field.input!.where!;
        const dbField = field.dbField;
        const { AND, OR, NOT, ...rest } = where.resolve ? await where.resolve(value) : value;
        return {
          AND: AND?.map((value: any) => nestWithAppropiateField(fieldKey, dbField, value)),
          OR: OR?.map((value: any) => nestWithAppropiateField(fieldKey, dbField, value)),
          NOT: NOT?.map((value: any) => nestWithAppropiateField(fieldKey, dbField, value)),
          ...nestWithAppropiateField(fieldKey, dbField, rest),
        };
      })
    ),
  };
}

type ValidationError = { msg: string; data: {}; internalData: {} };

type AddValidationError = (msg: string, data: {}, internalData: {}) => void;

async function validationHook(
  listKey: string,
  operation: 'create' | 'update' | 'delete',
  originalInput: Record<string, string> | undefined,
  validationHook: (addValidationError: AddValidationError) => void | Promise<void>
) {
  const errors: ValidationError[] = [];

  await validationHook((msg, data, internalData) => {
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

async function getAccessControlledItemByUniqueWhereForMutation(
  listKey: string,
  list: InitialisedList,
  context: KeystoneContext,
  access: boolean | InputFilter,
  id: IdType
): Promise<ItemRootValue> {
  if (access === false) {
    throwAccessDenied('mutation');
  }
  const prismaModel = getPrismaModelForList(context.prisma, listKey);
  let where: PrismaFilter = { id };
  if (typeof access === 'object') {
    where = { AND: [where, await list.inputResolvers.where(access)] };
  }
  const item = await prismaModel.findFirst({ where });
  if (item === null) {
    throwAccessDenied('mutation');
  }
  return item as any;
}

export async function processDelete(
  listKey: string,
  list: InitialisedList,
  context: KeystoneContext,
  itemId: IdType
) {
  const access = await validateNonCreateListAccessControl({
    access: list.access.delete,
    args: { context, listKey, operation: 'delete', session: context.session, itemId },
  });
  const existingItem = await getAccessControlledItemByUniqueWhereForMutation(
    listKey,
    list,
    context,
    access,
    itemId
  );

  const hookArgs = { operation: 'delete' as const, listKey, context, existingItem };
  await validationHook(listKey, 'delete', undefined, async addValidationError => {
    await Promise.all(
      Object.entries(list.fields).map(async ([fieldKey, field]) => {
        await field.hooks.validateDelete?.({
          ...hookArgs,
          addValidationError,
          fieldPath: fieldKey,
        });
      })
    );
  });

  await validationHook(listKey, 'delete', undefined, async addValidationError => {
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
  await Promise.all(
    Object.entries(list.fields).map(async ([fieldKey, field]) => {
      if (shouldRunFieldLevelHook(fieldKey)) {
        await field.hooks[hookName]?.({ fieldPath: fieldKey, ...args });
      }
    })
  );
  await list.hooks[hookName]?.(args);
}

async function resolveInputHook(
  listKey: string,
  list: InitialisedList,
  context: KeystoneContext,
  operation: 'create' | 'update',
  resolvedData: Record<string, any>,
  originalInput: Record<string, any>,
  existingItem: Record<string, any> | undefined
) {
  const args = { context, listKey, operation, originalInput, resolvedData, existingItem };
  resolvedData = await Promise.all(
    Object.entries(list.fields).map(([fieldKey, field]) => {
      if (field.hooks.resolveInput === undefined) {
        return [fieldKey, resolvedData[fieldKey]];
      }
      field.hooks.resolveInput({
        ...args,
        fieldPath: fieldKey,
      });
    })
  );
  if (list.hooks.resolveInput) {
    // TODO: the resolveInput types are wrong
    resolvedData = (await list.hooks.resolveInput(args)) as any;
  }
  return resolvedData;
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
          return [getDBFieldPathForFieldOnMultiField(fieldKey, innerFieldKey), fieldValue];
        });
      }
      return [[fieldKey, value]];
    })
  );
}

export async function resolveInputForCreateOrUpdate(
  listKey: string,
  operation: 'create' | 'update',
  list: InitialisedList,
  context: KeystoneContext,
  originalInput: Record<string, any>,
  existingItem: Record<string, any> | undefined
) {
  let resolvedData = Object.fromEntries(
    await Promise.all(
      Object.entries(list.fields).map(async ([fieldKey, field]) => {
        const inputConfig = field.input?.[operation];
        if (!inputConfig) {
          return [fieldKey, undefined] as const;
        }
        const input = originalInput[fieldKey];
        const resolved = inputConfig.resolve ? await inputConfig.resolve(input) : input;
        return [fieldKey, resolved] as const;
      })
    )
  );

  resolvedData = await resolveInputHook(
    listKey,
    list,
    context,
    operation,
    resolvedData,
    originalInput,
    existingItem
  );

  const args = {
    context,
    listKey,
    operation,
    originalInput,
    resolvedData,
    existingItem,
  };
  await validationHook(listKey, operation, undefined, async addValidationError => {
    await Promise.all(
      Object.entries(list.fields).map(async ([fieldKey, field]) => {
        await field.hooks.validateInput?.({
          ...args,
          addValidationError,
          fieldPath: fieldKey,
        });
      })
    );
  });

  await validationHook(listKey, operation, undefined, async addValidationError => {
    await list.hooks.validateInput?.({ ...args, addValidationError });
  });
  const originalInputKeys = new Set(Object.keys(originalInput));
  const shouldCallFieldLevelSideEffectHook = (fieldKey: string) => originalInputKeys.has(fieldKey);
  runSideEffectOnlyHook(list, 'beforeChange', args, shouldCallFieldLevelSideEffectHook);
  return {
    data: flattenMultiDbFields(list.fields, resolvedData),
    afterChange: async (updatedItem: ItemRootValue) => {
      await runSideEffectOnlyHook(
        list,
        'afterChange',
        { ...args, updatedItem, existingItem },
        shouldCallFieldLevelSideEffectHook
      );
    },
  };
}

export async function applyAccessControlForUpdate(
  listKey: string,
  list: InitialisedList,
  context: KeystoneContext,
  uniqueWhere: UniqueInputFilter,
  update: Record<string, any>
) {
  const prismaModel = getPrismaModelForList(context.prisma, listKey);
  const resolvedUniqueWhere = await list.inputResolvers.uniqueWhere(uniqueWhere);
  const itemId =
    resolvedUniqueWhere.id !== undefined
      ? resolvedUniqueWhere.id
      : await (async () => {
          const item = await prismaModel.findUnique({
            where: resolvedUniqueWhere,
            select: { id: true },
          });
          if (!item) {
            throw accessDeniedError('mutation');
          }
          return item.id;
        })();
  const accessControl = await validateNonCreateListAccessControl({
    access: list.access.update,
    args: {
      context,
      itemId,
      listKey,
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
        : { AND: [uniqueWhereInWhereForm, await list.inputResolvers.where(accessControl)] },
  });
  if (!item) {
    throw accessDeniedError('mutation');
  }
  await checkFieldAccessControlForUpdate(listKey, list, context, update, item);
  return item;
}

export async function applyAccessControlForCreate(
  listKey: string,
  list: InitialisedList,
  context: KeystoneContext,
  originalInput: Record<string, unknown>
) {
  const result = await validateCreateListAccessControl({
    access: list.access.create,
    args: {
      context,
      listKey,
      operation: 'create',
      originalInput,
      session: context.session,
    },
  });
  if (!result) {
    throwAccessDenied('mutation');
  }
  await checkFieldAccessControlForCreate(listKey, list, context, originalInput);
}

async function checkFieldAccessControlForUpdate(
  listKey: string,
  list: InitialisedList,
  context: KeystoneContext,
  originalInput: Record<string, any>,
  item: Record<string, any>
) {
  const results = await Promise.all(
    Object.entries(list.fields).map(([fieldKey, field]) => {
      return validateFieldAccessControl({
        access: field.access.update,
        args: {
          context,
          fieldKey,
          listKey,
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
    throwAccessDenied('mutation');
  }
}

async function checkFieldAccessControlForCreate(
  listKey: string,
  list: InitialisedList,
  context: KeystoneContext,
  originalInput: Record<string, any>
) {
  const results = await Promise.all(
    Object.entries(list.fields).map(([fieldKey, field]) => {
      return validateFieldAccessControl({
        access: field.access.create,
        args: {
          context,
          fieldKey,
          listKey,
          operation: 'create',
          originalInput,
          session: context.session,
        },
      });
    })
  );

  if (results.some(canAccess => !canAccess)) {
    throwAccessDenied('mutation');
  }
}
