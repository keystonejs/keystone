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
  const args = { operation, session: context.session, listKey: list.listKey, context };
  // Check the mutation access
  const access = list.access.filter[operation];
  try {
    // @ts-ignore
    let filters = typeof access === 'function' ? await access(args) : access;
    if (typeof filters === 'boolean') {
      return filters;
    }
    const schema = context.sudo().graphql.schema;
    const whereInput = assertInputObjectType(schema.getType(getGqlNames(list).whereInputName));
    const result = coerceAndValidateForGraphQLInput(schema, whereInput, filters);
    if (result.kind === 'valid') {
      return result.value;
    }
    throw result.error;
  } catch (error: any) {
    throw extensionError('Access control', [
      { error, tag: `${args.listKey}.access.filter.${args.operation}` },
    ]);
  }
}

export function parseFieldAccessControl(
  access: FieldAccessControl<BaseListTypeInfo> | undefined
): ResolvedFieldAccessControl {
  if (typeof access === 'boolean' || typeof access === 'function') {
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
  access: ListAccessControl<BaseListTypeInfo> | undefined
): ResolvedListAccessControl {
  let item, filter, operation;

  if (typeof access?.operation === 'function') {
    operation = {
      create: access.operation,
      query: access.operation,
      update: access.operation,
      delete: access.operation,
    };
  } else {
    // Note I'm intentionally not using spread here because typescript can't express
    // an optional property which cannot be undefined so spreading would mean there
    // is a possibility that someone could pass { access: undefined } or
    // { access: { read: undefined } } and bad things would happen.
    operation = {
      create: access?.operation?.create ?? (() => true),
      query: access?.operation?.query ?? (() => true),
      update: access?.operation?.update ?? (() => true),
      delete: access?.operation?.delete ?? (() => true),
    };
  }

  if (typeof access?.filter === 'boolean' || typeof access?.filter === 'function') {
    filter = { query: access.filter, update: access.filter, delete: access.filter };
  } else {
    filter = {
      // create: not supported
      query: access?.filter?.query ?? (() => true),
      update: access?.filter?.update ?? (() => true),
      delete: access?.filter?.delete ?? (() => true),
    };
  }

  if (typeof access?.item === 'boolean' || typeof access?.item === 'function') {
    item = { create: access.item, update: access.item, delete: access.item };
  } else {
    item = {
      create: access?.item?.create ?? (() => true),
      // read: not supported
      update: access?.item?.update ?? (() => true),
      delete: access?.item?.delete ?? (() => true),
    };
  }
  return { operation, filter, item };
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
