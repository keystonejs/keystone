import pLimit, { Limit } from 'p-limit';
import { KeystoneContext, DatabaseProvider, ItemRootValue } from '../../../types';
import { ResolvedDBField } from '../resolve-relationships';
import { InitialisedList } from '../types-for-lists';
import {
  promiseAllRejectWithAllErrors,
  getDBFieldKeyForFieldOnMultiField,
  IdType,
  runWithPrisma,
} from '../utils';
import { InputFilter, resolveUniqueWhereInput, UniqueInputFilter } from '../where-inputs';
import { accessDeniedError, extensionError } from '../graphql-errors';
import { getOperationAccess, getAccessFilters } from '../access-control';
import { checkFilterOrderAccess } from '../filter-order-access';
import {
  resolveRelateToManyForCreateInput,
  resolveRelateToManyForUpdateInput,
} from './nested-mutation-many-input-resolvers';
import {
  resolveRelateToOneForCreateInput,
  resolveRelateToOneForUpdateInput,
} from './nested-mutation-one-input-resolvers';
import { applyAccessControlForCreate, getAccessControlledItemForUpdate } from './access-control';
import { runSideEffectOnlyHook } from './hooks';
import { validateUpdateCreate } from './validation';

async function createSingle(
  { data: rawData }: { data: Record<string, any> },
  list: InitialisedList,
  context: KeystoneContext,
  operationAccess: boolean,
  writeLimit: Limit
) {
  // Operation level access control
  if (!operationAccess) {
    throw accessDeniedError(
      `You cannot perform the 'create' operation on the list '${list.listKey}'.`
    );
  }

  //  Item access control. Will throw an accessDeniedError if not allowed.
  await applyAccessControlForCreate(list, context, rawData);

  const { afterChange, data } = await resolveInputForCreateOrUpdate(
    list,
    context,
    rawData,
    undefined
  );

  const item = await writeLimit(() =>
    runWithPrisma(context, list, model => model.create({ data }))
  );

  return { item, afterChange };
}

export class NestedMutationState {
  #afterChanges: (() => void | Promise<void>)[] = [];
  #context: KeystoneContext;
  constructor(context: KeystoneContext) {
    this.#context = context;
  }
  async create(data: Record<string, any>, list: InitialisedList) {
    const context = this.#context;
    const writeLimit = pLimit(1);

    // Check operation permission to pass into single operation
    const operationAccess = await getOperationAccess(list, context, 'create');

    const { item, afterChange } = await createSingle(
      { data },
      list,
      context,
      operationAccess,
      writeLimit
    );

    this.#afterChanges.push(() => afterChange(item));
    return { id: item.id as IdType };
  }

  async afterChange() {
    await promiseAllRejectWithAllErrors(this.#afterChanges.map(async x => x()));
  }
}

export async function createOne(
  createInput: { data: Record<string, any> },
  list: InitialisedList,
  context: KeystoneContext
) {
  const writeLimit = pLimit(1);

  // Check operation permission to pass into single operation
  const operationAccess = await getOperationAccess(list, context, 'create');

  const { item, afterChange } = await createSingle(
    createInput,
    list,
    context,
    operationAccess,
    writeLimit
  );

  await afterChange(item);

  return item;
}

export async function createMany(
  createInputs: { data: Record<string, any>[] },
  list: InitialisedList,
  context: KeystoneContext,
  provider: DatabaseProvider
) {
  const writeLimit = pLimit(provider === 'sqlite' ? 1 : Infinity);

  // Check operation permission to pass into single operation
  const operationAccess = await getOperationAccess(list, context, 'create');

  return createInputs.data.map(async data => {
    const { item, afterChange } = await createSingle(
      { data },
      list,
      context,
      operationAccess,
      writeLimit
    );

    await afterChange(item);

    return item;
  });
}

async function updateSingle(
  updateInput: { where: UniqueInputFilter; data: Record<string, any> },
  list: InitialisedList,
  context: KeystoneContext,
  accessFilters: boolean | InputFilter,
  operationAccess: boolean,
  writeLimit: Limit
) {
  // Operation level access control
  if (!operationAccess) {
    throw accessDeniedError(
      `You cannot perform the 'update' operation on the list '${list.listKey}'.`
    );
  }

  const { where: uniqueInput, data: rawData } = updateInput;
  // Validate and resolve the input filter
  const uniqueWhere = await resolveUniqueWhereInput(uniqueInput, list.fields, context);

  // Check filter access
  const fieldKey = Object.keys(uniqueWhere)[0];
  await checkFilterOrderAccess([{ fieldKey, list }], context, 'filter');

  // Filter and Item access control. Will throw an accessDeniedError if not allowed.
  const existingItem = await getAccessControlledItemForUpdate(
    list,
    context,
    uniqueWhere,
    accessFilters,
    rawData
  );

  const { afterChange, data } = await resolveInputForCreateOrUpdate(
    list,
    context,
    rawData,
    existingItem
  );

  const updatedItem = await writeLimit(() =>
    runWithPrisma(context, list, model => model.update({ where: { id: existingItem.id }, data }))
  );

  await afterChange(updatedItem);

  return updatedItem;
}

export async function updateOne(
  updateInput: { where: UniqueInputFilter; data: Record<string, any> },
  list: InitialisedList,
  context: KeystoneContext
) {
  const writeLimit = pLimit(1);

  // Check operation permission to pass into single operation
  const operationAccess = await getOperationAccess(list, context, 'update');

  // Get list-level access control filters
  const accessFilters = await getAccessFilters(list, context, 'update');

  return updateSingle(updateInput, list, context, accessFilters, operationAccess, writeLimit);
}

export async function updateMany(
  { data }: { data: { where: UniqueInputFilter; data: Record<string, any> }[] },
  list: InitialisedList,
  context: KeystoneContext,
  provider: DatabaseProvider
) {
  const writeLimit = pLimit(provider === 'sqlite' ? 1 : Infinity);

  // Check operation permission to pass into single operation
  const operationAccess = await getOperationAccess(list, context, 'update');

  // Get list-level access control filters
  const accessFilters = await getAccessFilters(list, context, 'update');

  return data.map(async updateInput =>
    updateSingle(updateInput, list, context, accessFilters, operationAccess, writeLimit)
  );
}

async function getResolvedData(
  list: InitialisedList,
  hookArgs: {
    context: KeystoneContext;
    listKey: string;
    operation: 'create' | 'update';
    originalInput: Record<string, any>;
    existingItem: Record<string, any> | undefined;
  },
  nestedMutationState: NestedMutationState
) {
  const { context, operation, originalInput } = hookArgs;

  // Start with the original input
  let resolvedData = hookArgs.originalInput;

  // Apply default values
  // We don't expect any errors from here, so we can wrap all these operations
  // in a generic catch-all error handler.
  if (operation === 'create') {
    resolvedData = Object.fromEntries(
      await promiseAllRejectWithAllErrors(
        Object.entries(list.fields).map(async ([fieldKey, field]) => {
          let input = resolvedData[fieldKey];
          if (input === undefined && field.__legacy?.defaultValue !== undefined) {
            input =
              typeof field.__legacy.defaultValue === 'function'
                ? await field.__legacy.defaultValue({ originalInput, context })
                : field.__legacy.defaultValue;
          }
          return [fieldKey, input] as const;
        })
      )
    );
  }

  // Apply non-relationship field type input resolvers
  resolvedData = Object.fromEntries(
    await promiseAllRejectWithAllErrors(
      Object.entries(list.fields).map(async ([fieldKey, field]) => {
        const inputResolver = field.input?.[operation]?.resolve;
        let input = resolvedData[fieldKey];
        if (inputResolver && field.dbField.kind !== 'relation') {
          input = await inputResolver(input, context, undefined);
        }
        return [fieldKey, input] as const;
      })
    )
  );

  // Apply relationship field type input resolvers
  resolvedData = Object.fromEntries(
    await promiseAllRejectWithAllErrors(
      Object.entries(list.fields).map(async ([fieldKey, field]) => {
        const inputResolver = field.input?.[operation]?.resolve;
        let input = resolvedData[fieldKey];
        if (inputResolver && field.dbField.kind === 'relation') {
          input = await inputResolver(
            input,
            context,
            // This third argument only applies to relationship fields
            (() => {
              if (input === undefined) {
                // No-op: This is what we want
                return () => undefined;
              }
              if (input === null) {
                // No-op: Should this be UserInputError?
                return () => undefined;
              }
              const target = `${list.listKey}.${fieldKey}<${field.dbField.list}>`;
              const foreignList = list.lists[field.dbField.list];
              let resolver;
              if (field.dbField.mode === 'many') {
                if (operation === 'create') {
                  resolver = resolveRelateToManyForCreateInput;
                } else {
                  resolver = resolveRelateToManyForUpdateInput;
                }
              } else {
                if (operation === 'create') {
                  resolver = resolveRelateToOneForCreateInput;
                } else {
                  resolver = resolveRelateToOneForUpdateInput;
                }
              }
              return resolver(nestedMutationState, context, foreignList, target);
            })()
          );
        }
        return [fieldKey, input] as const;
      })
    )
  );

  // Resolve input hooks
  const hookName = 'resolveInput';
  // Field hooks
  let _resolvedData: Record<string, any> = {};
  const fieldsErrors: { error: Error; tag: string }[] = [];
  for (const [fieldKey, field] of Object.entries(list.fields)) {
    if (field.hooks.resolveInput === undefined) {
      _resolvedData[fieldKey] = resolvedData[fieldKey];
    } else {
      try {
        _resolvedData[fieldKey] = await field.hooks.resolveInput({
          ...hookArgs,
          resolvedData,
          fieldKey,
        });
      } catch (error: any) {
        fieldsErrors.push({ error, tag: `${list.listKey}.${fieldKey}` });
      }
    }
  }
  if (fieldsErrors.length) {
    throw extensionError(hookName, fieldsErrors);
  }
  resolvedData = _resolvedData;

  // List hooks
  if (list.hooks.resolveInput) {
    try {
      resolvedData = (await list.hooks.resolveInput({ ...hookArgs, resolvedData })) as any;
    } catch (error: any) {
      throw extensionError(hookName, [{ error, tag: list.listKey }]);
    }
  }

  return resolvedData;
}

async function resolveInputForCreateOrUpdate(
  list: InitialisedList,
  context: KeystoneContext,
  originalInput: Record<string, any>,
  existingItem: Record<string, any> | undefined
) {
  const operation: 'create' | 'update' = existingItem === undefined ? 'create' : 'update';
  const nestedMutationState = new NestedMutationState(context);
  const { listKey } = list;
  const hookArgs = {
    context,
    listKey,
    operation,
    originalInput,
    existingItem,
    resolvedData: {},
  };

  // Take the original input and resolve all the fields down to what
  // will be saved into the database.
  hookArgs.resolvedData = await getResolvedData(list, hookArgs, nestedMutationState);

  // Apply all validation checks
  await validateUpdateCreate({ list, hookArgs });

  // Run beforeChange hooks
  await runSideEffectOnlyHook(list, 'beforeChange', hookArgs);

  // Return the full resolved input (ready for prisma level operation),
  // and the afterChange hook to be applied
  return {
    data: flattenMultiDbFields(list.fields, hookArgs.resolvedData),
    afterChange: async (updatedItem: ItemRootValue) => {
      await nestedMutationState.afterChange();
      await runSideEffectOnlyHook(list, 'afterChange', { ...hookArgs, updatedItem, existingItem });
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
