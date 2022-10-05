import { assertInputObjectType } from 'graphql';
import {
  BaseListTypeInfo,
  CreateListItemAccessControl,
  FieldAccessControl,
  IndividualFieldAccessControl,
  ListAccessControl,
  DeleteListItemAccessControl,
  FieldCreateItemAccessArgs,
  FieldReadItemAccessArgs,
  FieldUpdateItemAccessArgs,
  UpdateListItemAccessControl,
  ListOperationAccessControl,
  ListFilterAccessControl,
  KeystoneContext,
  getGqlNames,
} from '../../types';
import { coerceAndValidateForGraphQLInput } from '../coerceAndValidateForGraphQLInput';
import { accessReturnError, extensionError } from './graphql-errors';
import { InitialisedList } from './types-for-lists';
import { InputFilter } from './where-inputs';

export function cannotForItem(operation: string, list: InitialisedList) {
  return (
    `You cannot '${operation}' that ${list.listKey}` +
    (operation === 'create' ? '' : ' - it may not exist')
  );
}

export function cannotForItemFields(
  operation: string,
  list: InitialisedList,
  fieldsDenied: string[]
) {
  return `You cannot '${operation}' that ${
    list.listKey
  } - you cannot '${operation}' the fields ${JSON.stringify(fieldsDenied)}`;
}

export async function getOperationAccess(
  list: InitialisedList,
  context: KeystoneContext,
  operation: 'delete' | 'create' | 'update' | 'query'
) {
  const args = { operation, session: context.session, listKey: list.listKey, context };
  // Check the mutation access
  const access = list.access.operation[operation];
  let result;
  try {
    // @ts-ignore
    result = await access(args);
  } catch (error: any) {
    throw extensionError('Access control', [
      { error, tag: `${list.listKey}.access.operation.${args.operation}` },
    ]);
  }

  const resultType = typeof result;

  // It's important that we don't cast objects to truthy values, as there's a strong chance that the user
  // has accidentally tried to return a filter.
  if (resultType !== 'boolean') {
    throw accessReturnError([
      { tag: `${args.listKey}.access.operation.${args.operation}`, returned: resultType },
    ]);
  }

  return result;
}

export async function getAccessFilters(
  list: InitialisedList,
  context: KeystoneContext,
  operation: 'update' | 'query' | 'delete'
): Promise<boolean | InputFilter> {
  const access = list.access.filter[operation];
  try {
    const filters = await access({
      operation,
      session: context.session,
      list: list.listKey,
      context,
    } as any); // TODO: FIXME
    if (typeof filters === 'boolean') return filters;

    const schema = context.sudo().graphql.schema;
    const whereInput = assertInputObjectType(schema.getType(getGqlNames(list).whereInputName));
    const result = coerceAndValidateForGraphQLInput(schema, whereInput, filters);
    if (result.kind === 'valid') return result.value;
    throw result.error;
  } catch (error: any) {
    throw extensionError('Access control', [
      { error, tag: `${list.listKey}.access.filter.${operation}` },
    ]);
  }
}

export function parseFieldAccessControl(
  access: FieldAccessControl<BaseListTypeInfo> | undefined
): ResolvedFieldAccessControl {
  if (typeof access === 'function') {
    return { read: access, create: access, update: access };
  }
  // note i'm intentionally not using spread here because typescript can't express an optional property which cannot be undefined so spreading would mean there is a possibility that someone could pass {access: undefined} or {access:{read: undefined}} and bad things would happen
  return {
    read: access?.read ?? (() => true),
    create: access?.create ?? (() => true),
    update: access?.update ?? (() => true),
    // delete: not supported
  };
}

export type ResolvedFieldAccessControl = {
  read: IndividualFieldAccessControl<FieldReadItemAccessArgs<BaseListTypeInfo>>;
  create: IndividualFieldAccessControl<FieldCreateItemAccessArgs<BaseListTypeInfo>>;
  update: IndividualFieldAccessControl<FieldUpdateItemAccessArgs<BaseListTypeInfo>>;
};

export function parseListAccessControl(
  access: ListAccessControl<BaseListTypeInfo>
): ResolvedListAccessControl {
  if (typeof access === 'function') {
    return {
      operation: {
        create: access,
        query: access,
        update: access,
        delete: access,
      },
      filter: {
        query: () => true,
        update: () => true,
        delete: () => true,
      },
      item: {
        create: () => true,
        update: () => true,
        delete: () => true,
      },
    };
  }

  let { operation, filter, item } = access;
  if (typeof operation === 'function') {
    operation = {
      create: operation,
      query: operation,
      update: operation,
      delete: operation,
    };
  }

  return {
    operation: {
      create: operation.create ?? (() => true),
      query: operation.query ?? (() => true),
      update: operation.update ?? (() => true),
      delete: operation.delete ?? (() => true),
    },
    filter: {
      // create: not supported
      query: filter?.query ?? (() => true),
      update: filter?.update ?? (() => true),
      delete: filter?.delete ?? (() => true),
    },
    item: {
      create: item?.create ?? (() => true),
      // query: not supported
      update: item?.update ?? (() => true),
      delete: item?.delete ?? (() => true),
    },
  };
}

export type ResolvedListAccessControl = {
  operation: {
    create: ListOperationAccessControl<'create', BaseListTypeInfo>;
    query: ListOperationAccessControl<'query', BaseListTypeInfo>;
    update: ListOperationAccessControl<'update', BaseListTypeInfo>;
    delete: ListOperationAccessControl<'delete', BaseListTypeInfo>;
  };
  filter: {
    // create: not supported
    query: ListFilterAccessControl<'query', BaseListTypeInfo>;
    update: ListFilterAccessControl<'update', BaseListTypeInfo>;
    delete: ListFilterAccessControl<'delete', BaseListTypeInfo>;
  };
  item: {
    create: CreateListItemAccessControl<BaseListTypeInfo>;
    // query: not supported
    update: UpdateListItemAccessControl<BaseListTypeInfo>;
    delete: DeleteListItemAccessControl<BaseListTypeInfo>;
  };
};
