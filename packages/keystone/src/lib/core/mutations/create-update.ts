import { KeystoneContext, DatabaseProvider, ItemRootValue } from '@keystone-next/types';
import pLimit from 'p-limit';
import { ResolvedDBField } from '../resolve-relationships';
import { InitialisedList } from '../types-for-lists';
import {
  getPrismaModelForList,
  promiseAllRejectWithAllErrors,
  getDBFieldKeyForFieldOnMultiField,
  IdType,
} from '../utils';
import {
  resolveRelateToManyForCreateInput,
  resolveRelateToManyForUpdateInput,
} from './nested-mutation-many-input-resolvers';
import {
  resolveRelateToOneForCreateInput,
  resolveRelateToOneForUpdateInput,
} from './nested-mutation-one-input-resolvers';
import { applyAccessControlForCreate, getAccessControlledItemForUpdate } from './access-control';
import { runSideEffectOnlyHook, validationHook } from './hooks';

export class NestedMutationState {
  #afterChanges: (() => void | Promise<void>)[] = [];
  #context: KeystoneContext;
  constructor(context: KeystoneContext) {
    this.#context = context;
  }
  async create(
    input: Record<string, any>,
    list: InitialisedList
  ): Promise<{ kind: 'connect'; id: IdType } | { kind: 'create'; data: Record<string, any> }> {
    const { afterChange, data } = await createOneState({ data: input }, list, this.#context);

    const item = await getPrismaModelForList(this.#context.prisma, list.listKey).create({ data });

    this.#afterChanges.push(() => afterChange(item));
    return { kind: 'connect' as const, id: item.id as any };
  }
  async afterChange() {
    await promiseAllRejectWithAllErrors(this.#afterChanges.map(async x => x()));
  }
}

export async function createOneState(
  { data: rawData }: { data: Record<string, any> },
  list: InitialisedList,
  context: KeystoneContext
) {
  await applyAccessControlForCreate(list, context, rawData);

  return resolveInputForCreateOrUpdate(list, context, rawData, undefined);
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

export async function updateOne(
  {
    where: rawUniqueWhere,
    data: rawData,
  }: { where: Record<string, any>; data: Record<string, any> },
  list: InitialisedList,
  context: KeystoneContext
) {
  const item = await getAccessControlledItemForUpdate(list, context, rawUniqueWhere, rawData);
  const { afterChange, data } = await resolveInputForCreateOrUpdate(list, context, rawData, item);

  const updatedItem = await getPrismaModelForList(context.prisma, list.listKey).update({
    where: { id: item.id },
    data,
  });

  await afterChange(updatedItem);

  return updatedItem;
}

export function updateMany(
  { data }: { data: { where: Record<string, any>; data: Record<string, any> }[] },
  list: InitialisedList,
  context: KeystoneContext,
  provider: DatabaseProvider
) {
  const writeLimit = pLimit(provider === 'sqlite' ? 1 : Infinity);
  return data.map(async ({ data: rawData, where: rawUniqueWhere }) => {
    const item = await getAccessControlledItemForUpdate(list, context, rawUniqueWhere, rawData);
    const { afterChange, data } = await resolveInputForCreateOrUpdate(list, context, rawData, item);
    const updatedItem = await writeLimit(() =>
      getPrismaModelForList(context.prisma, list.listKey).update({ where: { id: item.id }, data })
    );
    await afterChange(updatedItem);
    return updatedItem;
  });
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
        // Apply default values
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

        // Resolve field type input resolvers
        const resolved = inputConfig?.resolve
          ? await inputConfig.resolve(
              input,
              context,
              (() => {
                if (field.dbField.kind !== 'relation') {
                  return undefined;
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
                  } else {
                    return resolveRelateToManyForUpdateInput(
                      nestedMutationState,
                      context,
                      foreignList,
                      target
                    );
                  }
                } else {
                  if (operation === 'create') {
                    return resolveRelateToOneForCreateInput(
                      nestedMutationState,
                      context,
                      foreignList,
                      target
                    );
                  } else {
                    return resolveRelateToOneForUpdateInput(
                      nestedMutationState,
                      context,
                      foreignList,
                      target
                    );
                  }
                }
              })()
            )
          : input;
        return [fieldKey, resolved] as const;
      })
    )
  );

  // Resolve input hooks
  resolvedData = await resolveInputHook(
    list,
    context,
    operation,
    resolvedData,
    originalInput,
    existingItem
  );

  // Check isRequired
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

  // Field validation hooks
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

  // List validation hooks
  await validationHook(list.listKey, operation, originalInput, async addValidationError => {
    await list.hooks.validateInput?.({ ...args, addValidationError });
  });

  // Run beforeChange hooks
  const originalInputKeys = new Set(Object.keys(originalInput));
  const shouldCallFieldLevelSideEffectHook = (fieldKey: string) => originalInputKeys.has(fieldKey);
  await runSideEffectOnlyHook(list, 'beforeChange', args, shouldCallFieldLevelSideEffectHook);

  // Return the full resolved input (ready for prisma level operation),
  // and the afterChange hook to be applied
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
        const value = await field.hooks.resolveInput({ ...args, fieldPath: fieldKey });
        return [fieldKey, value];
      })
    )
  );
  if (list.hooks.resolveInput) {
    resolvedData = (await list.hooks.resolveInput({ ...args, resolvedData })) as any;
  }
  return resolvedData;
}
