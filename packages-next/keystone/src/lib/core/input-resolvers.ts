import { ItemRootValue, KeystoneContext, NextFieldType } from '@keystone-next/types';
import { validateNonCreateListAccessControl } from '../createAccessControlContext';
import { throwAccessDenied, ValidationFailureError } from './ListTypes/graphqlErrors';
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
    args: {
      context,
      listKey,
      operation: 'delete',
      session: context.session,
      itemId,
    },
  });
  const existingItem = await getAccessControlledItemByUniqueWhereForMutation(
    listKey,
    list,
    context,
    access,
    itemId
  );

  const hookArgs = {
    operation: 'delete' as const,
    listKey,
    context,
    existingItem,
  };
  validationHook(listKey, 'delete', undefined, async addValidationError => {
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

  validationHook(listKey, 'delete', undefined, async addValidationError => {
    list.hooks.validateDelete?.({ ...hookArgs, addValidationError });
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
