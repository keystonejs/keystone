import { KeystoneContext, BaseItem } from '../../../types';
import { ResolvedDBField } from '../resolve-relationships';
import { InitialisedList } from '../types-for-lists';
import {
  promiseAllRejectWithAllErrors,
  getDBFieldKeyForFieldOnMultiField,
  IdType,
  runWithPrisma,
  getWriteLimit,
} from '../utils';
import { InputFilter, resolveUniqueWhereInput, UniqueInputFilter } from '../where-inputs';
import {
  accessDeniedError,
  extensionError,
  relationshipError,
  resolverError,
} from '../graphql-errors';
import { getOperationAccess, getAccessFilters } from '../access-control';
import { checkFilterOrderAccess } from '../filter-order-access';
import {
  RelationshipErrors,
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
  operationAccess: boolean
) {
  // Operation level access control
  if (!operationAccess) {
    throw accessDeniedError(
      `You cannot perform the 'create' operation on the list '${list.listKey}'.`
    );
  }

  //  Item access control. Will throw an accessDeniedError if not allowed.
  await applyAccessControlForCreate(list, context, rawData);

  const { afterOperation, data } = await resolveInputForCreateOrUpdate(
    list,
    context,
    rawData,
    undefined
  );

  const writeLimit = getWriteLimit(context);

  const item = await writeLimit(() =>
    runWithPrisma(context, list, model => model.create({ data }))
  );

  return { item, afterOperation };
}

export class NestedMutationState {
  #afterOperations: (() => void | Promise<void>)[] = [];
  #context: KeystoneContext;
  constructor(context: KeystoneContext) {
    this.#context = context;
  }
  async create(data: Record<string, any>, list: InitialisedList) {
    const context = this.#context;

    // Check operation permission to pass into single operation
    const operationAccess = await getOperationAccess(list, context, 'create');

    const { item, afterOperation } = await createSingle({ data }, list, context, operationAccess);

    this.#afterOperations.push(() => afterOperation(item));
    return { id: item.id as IdType };
  }

  async afterOperation() {
    await promiseAllRejectWithAllErrors(this.#afterOperations.map(async x => x()));
  }
}

export async function createOne(
  createInput: { data: Record<string, any> },
  list: InitialisedList,
  context: KeystoneContext
) {
  // Check operation permission to pass into single operation
  const operationAccess = await getOperationAccess(list, context, 'create');

  const { item, afterOperation } = await createSingle(createInput, list, context, operationAccess);

  await afterOperation(item);

  return item;
}

export async function createMany(
  createInputs: { data: Record<string, any>[] },
  list: InitialisedList,
  context: KeystoneContext
) {
  // Check operation permission to pass into single operation
  const operationAccess = await getOperationAccess(list, context, 'create');

  return createInputs.data.map(async data => {
    const { item, afterOperation } = await createSingle({ data }, list, context, operationAccess);

    await afterOperation(item);

    return item;
  });
}

async function updateSingle(
  updateInput: { where: UniqueInputFilter; data: Record<string, any> },
  list: InitialisedList,
  context: KeystoneContext,
  accessFilters: boolean | InputFilter,
  operationAccess: boolean
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
  const item = await getAccessControlledItemForUpdate(
    list,
    context,
    uniqueWhere,
    accessFilters,
    rawData
  );

  const { afterOperation, data } = await resolveInputForCreateOrUpdate(
    list,
    context,
    rawData,
    item
  );

  const writeLimit = getWriteLimit(context);

  const updatedItem = await writeLimit(() =>
    runWithPrisma(context, list, model => model.update({ where: { id: item.id }, data }))
  );

  await afterOperation(updatedItem);

  return updatedItem;
}

export async function updateOne(
  updateInput: { where: UniqueInputFilter; data: Record<string, any> },
  list: InitialisedList,
  context: KeystoneContext
) {
  // Check operation permission to pass into single operation
  const operationAccess = await getOperationAccess(list, context, 'update');

  // Get list-level access control filters
  const accessFilters = await getAccessFilters(list, context, 'update');

  return updateSingle(updateInput, list, context, accessFilters, operationAccess);
}

export async function updateMany(
  { data }: { data: { where: UniqueInputFilter; data: Record<string, any> }[] },
  list: InitialisedList,
  context: KeystoneContext
) {
  // Check operation permission to pass into single operation
  const operationAccess = await getOperationAccess(list, context, 'update');

  // Get list-level access control filters
  const accessFilters = await getAccessFilters(list, context, 'update');

  return data.map(async updateInput =>
    updateSingle(updateInput, list, context, accessFilters, operationAccess)
  );
}

async function getResolvedData(
  list: InitialisedList,
  hookArgs: {
    context: KeystoneContext;
    listKey: string;
    inputData: Record<string, any>;
  } & ({ operation: 'create'; item: undefined } | { operation: 'update'; item: BaseItem }),
  nestedMutationState: NestedMutationState
) {
  const { context, operation } = hookArgs;

  // Start with the original input
  let resolvedData = hookArgs.inputData;

  // Apply non-relationship field type input resolvers
  const resolverErrors: { error: Error; tag: string }[] = [];
  resolvedData = Object.fromEntries(
    await Promise.all(
      Object.entries(list.fields).map(async ([fieldKey, field]) => {
        const inputResolver = field.input?.[operation]?.resolve;
        let input = resolvedData[fieldKey];
        if (inputResolver && field.dbField.kind !== 'relation') {
          try {
            input = await inputResolver(input, context, undefined);
          } catch (error: any) {
            resolverErrors.push({ error, tag: `${list.listKey}.${fieldKey}` });
          }
        }
        return [fieldKey, input] as const;
      })
    )
  );
  if (resolverErrors.length) {
    throw resolverError(resolverErrors);
  }

  // Apply relationship field type input resolvers
  const relationshipErrors: { error: Error; tag: string }[] = [];
  resolvedData = Object.fromEntries(
    await Promise.all(
      Object.entries(list.fields).map(async ([fieldKey, field]) => {
        const inputResolver = field.input?.[operation]?.resolve;
        let input = resolvedData[fieldKey];
        if (inputResolver && field.dbField.kind === 'relation') {
          const tag = `${list.listKey}.${fieldKey}`;
          try {
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
                return resolver(nestedMutationState, context, foreignList, tag);
              })()
            );
          } catch (error: any) {
            if (error instanceof RelationshipErrors) {
              relationshipErrors.push(...error.errors);
            } else {
              relationshipErrors.push({ error, tag });
            }
          }
        }
        return [fieldKey, input] as const;
      })
    )
  );
  if (relationshipErrors.length) {
    throw relationshipError(relationshipErrors);
  }

  // Resolve input hooks
  const hookName = 'resolveInput';
  // Field hooks
  const fieldsErrors: { error: Error; tag: string }[] = [];
  resolvedData = Object.fromEntries(
    await Promise.all(
      Object.entries(list.fields).map(async ([fieldKey, field]) => {
        if (field.hooks.resolveInput === undefined) {
          return [fieldKey, resolvedData[fieldKey]];
        } else {
          try {
            return [
              fieldKey,
              await field.hooks.resolveInput({
                ...hookArgs,
                resolvedData,
                fieldKey,
              }),
            ];
          } catch (error: any) {
            fieldsErrors.push({ error, tag: `${list.listKey}.${fieldKey}.hooks.${hookName}` });
            return [fieldKey, undefined];
          }
        }
      })
    )
  );
  if (fieldsErrors.length) {
    throw extensionError(hookName, fieldsErrors);
  }

  // List hooks
  if (list.hooks.resolveInput) {
    try {
      resolvedData = (await list.hooks.resolveInput({ ...hookArgs, resolvedData })) as any;
    } catch (error: any) {
      throw extensionError(hookName, [{ error, tag: `${list.listKey}.hooks.${hookName}` }]);
    }
  }

  return resolvedData;
}

async function resolveInputForCreateOrUpdate(
  list: InitialisedList,
  context: KeystoneContext,
  inputData: Record<string, any>,
  item: BaseItem | undefined
) {
  const nestedMutationState = new NestedMutationState(context);
  const baseHookArgs = {
    context,
    listKey: list.listKey,
    inputData,
    resolvedData: {},
  };
  const hookArgs =
    item === undefined
      ? { ...baseHookArgs, operation: 'create' as const, item }
      : { ...baseHookArgs, operation: 'update' as const, item };

  // Take the original input and resolve all the fields down to what
  // will be saved into the database.
  hookArgs.resolvedData = await getResolvedData(list, hookArgs, nestedMutationState);

  // Apply all validation checks
  await validateUpdateCreate({ list, hookArgs });

  // Run beforeOperation hooks
  await runSideEffectOnlyHook(list, 'beforeOperation', hookArgs);

  // Return the full resolved input (ready for prisma level operation),
  // and the afterOperation hook to be applied
  return {
    data: flattenMultiDbFields(list.fields, hookArgs.resolvedData),
    afterOperation: async (updatedItem: BaseItem) => {
      await nestedMutationState.afterOperation();
      await runSideEffectOnlyHook(
        list,
        'afterOperation',
        // at runtime this conditional is pointless
        // but TypeScript needs it because in each case, it will narrow
        // `hookArgs` based on the `operation` which will make `hookArgs.item`
        // be the right type for `originalItem` for the operation
        hookArgs.operation === 'create'
          ? { ...hookArgs, item: updatedItem, originalItem: hookArgs.item }
          : { ...hookArgs, item: updatedItem, originalItem: hookArgs.item }
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
