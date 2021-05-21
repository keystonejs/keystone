import {
  ItemRootValue,
  KeystoneContext,
  NextFieldType,
  OrderDirection,
} from '@keystone-next/types';
import { validateCreateListAccessControl, validateFieldAccessControl } from './access-control';
import { validateNonCreateListAccessControl } from './access-control';
import { mapUniqueWhereToWhere } from './query-resolvers';
import {
  accessDeniedError,
  throwAccessDenied,
  ValidationFailureError,
} from './ListTypes/graphqlErrors';
import { getDBFieldPathForFieldOnMultiField, ResolvedDBField } from './prisma-schema';
import { InitialisedList } from './types-for-lists';
import { getPrismaModelForList, IdType } from './utils';
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
  AND?: PrismaFilter[];
  OR?: PrismaFilter[];
  NOT?: PrismaFilter[];
  // just so that if you pass an array to something expecting a PrismaFilter, you get an error
  length?: undefined;
};

export type UniqueInputFilter = Record<string, any> & { _____?: 'unique input filter' };
export type UniquePrismaFilter = Record<string, any> & { _____?: 'unique prisma filter' };

export type CreateItemInput = Record<string, any> & { _____?: 'create item input' };
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

export type FilterInputResolvers = {
  where: (where: InputFilter) => Promise<PrismaFilter>;
};

export type CreateAndUpdateInputResolvers = {
  uniqueWhere: (where: UniqueInputFilter) => Promise<UniquePrismaFilter>;
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

type FieldInfoRequiredForResolvingWhereInput = Record<
  string,
  // i am intentionally only passing in specific things to make it clear this function cares about nothing else
  {
    dbField: ResolvedDBField;
    input?: {
      where?: NonNullable<NonNullable<NextFieldType['input']>['where']>;
    };
  }
>;

async function resolveWhereInput(
  inputFilter: InputFilter,
  fields: FieldInfoRequiredForResolvingWhereInput,
  context: KeystoneContext,
  inputResolvers: Record<string, FilterInputResolvers>
): Promise<PrismaFilter> {
  return {
    AND: await Promise.all(
      Object.entries(inputFilter).map(async ([fieldKey, value]) => {
        if (fieldKey === 'OR' || fieldKey === 'AND' || fieldKey === 'NOT') {
          return {
            [fieldKey]: await Promise.all(
              value.map((value: any) => resolveWhereInput(value, fields, context, inputResolvers))
            ),
          };
        }
        const field = fields[fieldKey];
        // we know if there are filters in the input object with the key of a field, the field must have defined a where input so this non null assertion is okay
        const where = field.input!.where!;
        const dbField = field.dbField;
        const ret = where.resolve
          ? await where.resolve(
              value,
              context,
              (() => {
                if (field.dbField.kind !== 'relation') {
                  return undefined as any;
                }
                const whereResolver = inputResolvers[field.dbField.list].where;
                if (field.dbField.mode === 'many') {
                  return async () => {
                    if (value === null) {
                      throw new Error('A many relation filter cannot be set to null');
                    }
                    return Object.fromEntries(
                      await Promise.all(
                        Object.entries(value).map(async ([key, val]) => {
                          if (val === null) {
                            throw new Error(
                              `The key ${key} in a many relation filter cannot be set to null`
                            );
                          }
                          return [key, await whereResolver(val as any)];
                        })
                      )
                    );
                  };
                }
                return whereResolver;
              })()
            )
          : value;
        if (ret === null) {
          if (field.dbField.kind === 'multi') {
            throw new Error('multi db fields cannot return null from where input resolvers');
          }
          return { [fieldKey]: null };
        }
        const { AND, OR, NOT, ...rest } = ret;
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

export function getFilterInputResolvers(
  lists: Record<string, { fields: FieldInfoRequiredForResolvingWhereInput }>
) {
  return weakMemoize(function filterInputResolversInner(context: KeystoneContext) {
    const inputResolvers = Object.fromEntries(
      Object.entries(lists).map(([listKey, { fields }]): [string, FilterInputResolvers] => {
        return [
          listKey,
          { where: async input => resolveWhereInput(input, fields, context, inputResolvers) },
        ];
      })
    );
    return inputResolvers;
  });
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

async function getAccessControlledItemForDelete(
  listKey: string,
  list: InitialisedList,
  context: KeystoneContext,
  access: boolean | InputFilter,
  inputFilter: UniqueInputFilter
): Promise<ItemRootValue> {
  if (access === false) {
    throw accessDeniedError('mutation');
  }
  const prismaModel = getPrismaModelForList(context.prisma, listKey);
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
  listKey: string,
  list: InitialisedList,
  context: KeystoneContext,
  filter: UniqueInputFilter
) {
  const access = await validateNonCreateListAccessControl({
    access: list.access.delete,
    args: { context, listKey, operation: 'delete', session: context.session },
  });
  const existingItem = await getAccessControlledItemForDelete(
    listKey,
    list,
    context,
    access,
    filter
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
  resolvedData = Object.fromEntries(
    await Promise.all(
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
  const nestedMutationState = list.inputResolvers.createAndUpdate(context);
  let resolvedData = Object.fromEntries(
    await Promise.all(
      Object.entries(list.fields).map(async ([fieldKey, field]) => {
        const inputConfig = field.input?.[operation];
        const input = originalInput[fieldKey];
        const resolved = inputConfig?.resolve
          ? await inputConfig.resolve(
              input,
              context,
              (() => {
                if (field.dbField.kind !== 'relation') {
                  return undefined as any;
                }
                const inputResolvers = nestedMutationState.resolvers[field.dbField.list];
                if (operation === 'create') {
                  if (field.dbField.mode === 'many') {
                    return resolveRelateToManyForCreateInput(inputResolvers);
                  }
                  return resolveRelateToOneForCreateInput(inputResolvers);
                }
                if (field.dbField.mode === 'many') {
                  return resolveRelateToManyForUpdateInput(inputResolvers);
                }
                return resolveRelateToOneForUpdateInput(inputResolvers);
              })()
            )
          : input;
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
  await runSideEffectOnlyHook(list, 'beforeChange', args, shouldCallFieldLevelSideEffectHook);
  return {
    data: flattenMultiDbFields(list.fields, resolvedData),
    afterChange: async (updatedItem: ItemRootValue) => {
      await Promise.all(nestedMutationState.afterChanges.map(x => x()));
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
  const resolvedUniqueWhere = await resolveUniqueWhereInput(uniqueWhere, list.fields, context);
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
        : {
            AND: [uniqueWhereInWhereForm, await list.inputResolvers.where(context)(accessControl)],
          },
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

export async function resolveOrderBy(
  orderBy: readonly Record<string, any>[],
  list: InitialisedList,
  context: KeystoneContext
): Promise<readonly Record<string, OrderDirection>[]> {
  return Promise.all(
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
  );
}
