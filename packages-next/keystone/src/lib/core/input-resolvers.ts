import { ItemRootValue, KeystoneContext, OrderDirection } from '@keystone-next/types';
import { validateCreateListAccessControl, validateFieldAccessControl } from './access-control';
import { validateNonCreateListAccessControl } from './access-control';
import { mapUniqueWhereToWhere } from './queries/resolvers';
import { accessDeniedError, ValidationFailureError } from './graphql-errors';
import { getDBFieldPathForFieldOnMultiField, ResolvedDBField } from './prisma-schema';
import { InitialisedList } from './types-for-lists';
import { getPrismaModelForList, IdType, promiseAllRejectWithAllErrors } from './utils';
import {
  resolveRelateToManyForCreateInput,
  resolveRelateToManyForUpdateInput,
  resolveRelateToOneForCreateInput,
  resolveRelateToOneForUpdateInput,
} from './nested-mutation-input-resolvers';

// this is wrong, what is being enforcing with this should be enforced by using generics
export type InputFilter = Record<string, any> & {
  _____?: 'input filter';
  AND?: InputFilter[];
  OR?: InputFilter[];
  NOT?: InputFilter[];
};
export type PrismaFilter = Record<string, any> & {
  _____?: 'prisma filter';
  AND?: PrismaFilter[] | PrismaFilter;
  OR?: PrismaFilter[] | PrismaFilter;
  NOT?: PrismaFilter[] | PrismaFilter;
  // just so that if you pass an array to something expecting a PrismaFilter, you get an error
  length?: undefined;
};

export type UniqueInputFilter = Record<string, any> & { _____?: 'unique input filter' };
export type UniquePrismaFilter = Record<string, any> & { _____?: 'unique prisma filter' };

export type CreateItemInput = Record<string, any> & { _____?: 'create item input' };
export type ResolvedCreateItemInput = Record<string, any> & { _____?: 'unique prisma filter' };

export type FilterInputResolvers = {
  where: (where: InputFilter) => Promise<PrismaFilter>;
};

export type CreateAndUpdateInputResolvers = {
  create: (
    input: Record<string, any>
  ) => Promise<{ kind: 'create'; data: Record<string, any> } | { kind: 'connect'; id: IdType }>;
};

export async function resolveUniqueWhereInput(
  input: UniqueInputFilter,
  fields: InitialisedList['fields'],
  context: KeystoneContext
): Promise<UniquePrismaFilter> {
  const inputKeys = Object.keys(input);
  if (inputKeys.length !== 1) {
    throw new Error(
      `Exactly one key must be passed in a unique where input but ${inputKeys.length} keys were passed`
    );
  }
  const key = inputKeys[0];
  const val = input[key];
  if (val === null) {
    throw new Error(`The unique value provided in a unique where input must not be null`);
  }
  const resolver = fields[key].input!.uniqueWhere!.resolve;
  const resolvedVal = resolver ? await resolver(val, context) : val;
  return {
    [key]: resolvedVal,
  };
}

async function resolveLegacyWhereInput(
  inputFilter: InputFilter,
  list: InitialisedList,
  context: KeystoneContext,
  inputResolvers: Record<string, FilterInputResolvers>
): Promise<PrismaFilter> {
  return {
    AND: await Promise.all(
      Object.entries(inputFilter).map(async ([fieldKey, value]) => {
        if (fieldKey === 'OR' || fieldKey === 'AND') {
          return {
            [fieldKey]: await Promise.all(
              value.map((value: any) =>
                resolveLegacyWhereInput(value, list, context, inputResolvers)
              )
            ),
          };
        }
        return list.filterImpls[fieldKey](value);
      })
    ),
  };
}

// the tuple preserves the argument name
export function weakMemoize<Args extends [object], Return>(
  func: (...args: Args) => Return
): (...args: Args) => Return {
  let cache = new WeakMap<Args[0], Return>();
  return arg => {
    if (cache.has(arg)) {
      return cache.get(arg)!;
    }
    let ret = (func as any)(arg);
    cache.set(arg, ret);
    return ret;
  };
}

export function getFilterInputResolvers(lists: Record<string, InitialisedList>) {
  return weakMemoize(function filterInputResolversInner(context: KeystoneContext) {
    const inputResolvers = Object.fromEntries(
      Object.entries(lists).map(([listKey, list]): [string, FilterInputResolvers] => {
        return [
          listKey,
          {
            where: async input => resolveLegacyWhereInput(input, list, context, inputResolvers),
          },
        ];
      })
    );
    return inputResolvers;
  });
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

export async function getAccessControlledItemForDelete(
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
    where = { AND: [where, await list.inputResolvers.where(context)(access)] };
  }
  const item = await prismaModel.findFirst({ where });
  if (item === null) {
    throw accessDeniedError('mutation');
  }
  return item;
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
  list: InitialisedList,
  context: KeystoneContext,
  originalInput: Record<string, any>,
  existingItem: Record<string, any> | undefined
) {
  const operation = existingItem === undefined ? ('create' as const) : ('update' as const);
  const nestedMutationState = list.inputResolvers.createAndUpdate(context);
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
                const inputResolvers = nestedMutationState.resolvers[field.dbField.list];
                const foreignList = list.lists[field.dbField.list];
                if (field.dbField.mode === 'many') {
                  if (operation === 'create') {
                    return resolveRelateToManyForCreateInput(
                      inputResolvers,
                      context,
                      foreignList,
                      target
                    );
                  }
                  return resolveRelateToManyForUpdateInput(
                    inputResolvers,
                    context,
                    foreignList,
                    target
                  );
                }
                if (operation === 'create') {
                  return resolveRelateToOneForCreateInput(
                    inputResolvers,
                    context,
                    foreignList,
                    target
                  );
                }
                return resolveRelateToOneForUpdateInput(
                  inputResolvers,
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
      await promiseAllRejectWithAllErrors(nestedMutationState.afterChanges.map(x => x()));
      await runSideEffectOnlyHook(
        list,
        'afterChange',
        { ...args, updatedItem, existingItem },
        shouldCallFieldLevelSideEffectHook
      );
    },
  };
}

export async function getStringifiedItemIdFromUniqueWhereInput(
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

export async function applyAccessControlForUpdate(
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
            AND: [uniqueWhereInWhereForm, await list.inputResolvers.where(context)(accessControl)],
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

export async function resolveOrderBy(
  orderBy: readonly Record<string, any>[],
  sortBy: readonly string[] | null | undefined,
  list: InitialisedList,
  context: KeystoneContext
): Promise<readonly Record<string, OrderDirection>[]> {
  return (
    await Promise.all(
      orderBy.map(async orderBySelection => {
        const keys = Object.keys(orderBySelection);
        if (keys.length !== 1) {
          throw new Error(
            `Only a single key must be passed to ${list.types.orderBy.graphQLType.name}`
          );
        }

        const fieldKey = keys[0];

        const value = orderBySelection[fieldKey];

        if (value === null) {
          throw new Error('null cannot be passed as an order direction');
        }

        const field = list.fields[fieldKey];
        const resolveOrderBy = field.input!.orderBy!.resolve;
        const resolvedValue = resolveOrderBy ? await resolveOrderBy(value, context) : value;
        if (field.dbField.kind === 'multi') {
          const keys = Object.keys(resolvedValue);
          if (keys.length !== 1) {
            throw new Error(
              `Only a single key must be returned from an orderBy input resolver for a multi db field`
            );
          }
          const innerKey = keys[0];
          return {
            [getDBFieldPathForFieldOnMultiField(fieldKey, innerKey)]: resolvedValue[innerKey],
          };
        }
        return { [fieldKey]: resolvedValue };
      })
    )
  ).concat(
    sortBy?.map(sort => {
      if (sort.endsWith('_DESC')) {
        return { [sort.slice(0, -'_DESC'.length)]: 'desc' };
      }
      return { [sort.slice(0, -'_ASC'.length)]: 'asc' };
    }) || []
  );
}
