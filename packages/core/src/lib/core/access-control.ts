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
    `You cannot ${operation} that ${list.listKey}` +
    (operation === 'create' ? '' : ' - it may not exist')
  );
}

export function cannotForItemFields(
  operation: string,
  list: InitialisedList,
  fieldsDenied: string[]
) {
  return `You cannot ${operation} that ${
    list.listKey
  } - you cannot ${operation} the fields ${JSON.stringify(fieldsDenied)}`;
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
  operation: keyof typeof list.access.filter
): Promise<boolean | InputFilter> {
  try {
    let filters;
    if (operation === 'query') {
      filters = await list.access.filter.query({
        operation,
        session: context.session,
        listKey: list.listKey,
        context,
      });
    } else if (operation === 'update') {
      filters = await list.access.filter.update({
        operation,
        session: context.session,
        listKey: list.listKey,
        context,
      });
    } else if (operation === 'delete') {
      filters = await list.access.filter.delete({
        operation,
        session: context.session,
        listKey: list.listKey,
        context,
      });
    }

    if (typeof filters === 'boolean') return filters;
    if (!filters) return false; // shouldn't happen, but, Typescript

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

export type ResolvedFieldAccessControl = {
  create: IndividualFieldAccessControl<FieldCreateItemAccessArgs<BaseListTypeInfo>>;
  read: IndividualFieldAccessControl<FieldReadItemAccessArgs<BaseListTypeInfo>>;
  update: IndividualFieldAccessControl<FieldUpdateItemAccessArgs<BaseListTypeInfo>>;
};

export function parseFieldAccessControl(
  access: FieldAccessControl<BaseListTypeInfo> | undefined
): ResolvedFieldAccessControl {
  if (typeof access === 'function') {
    return { read: access, create: access, update: access };
  }

  return {
    read: access?.read ?? (() => true),
    create: access?.create ?? (() => true),
    update: access?.update ?? (() => true),
  };
}

export type ResolvedListAccessControl = {
  operation: {
    query: ListOperationAccessControl<'query', BaseListTypeInfo>;
    create: ListOperationAccessControl<'create', BaseListTypeInfo>;
    update: ListOperationAccessControl<'update', BaseListTypeInfo>;
    delete: ListOperationAccessControl<'delete', BaseListTypeInfo>;
  };
  filter: {
    query: ListFilterAccessControl<'query', BaseListTypeInfo>;
    // create: not supported
    update: ListFilterAccessControl<'update', BaseListTypeInfo>;
    delete: ListFilterAccessControl<'delete', BaseListTypeInfo>;
  };
  item: {
    // query: not supported
    create: CreateListItemAccessControl<BaseListTypeInfo>;
    update: UpdateListItemAccessControl<BaseListTypeInfo>;
    delete: DeleteListItemAccessControl<BaseListTypeInfo>;
  };
};

export function parseListAccessControl(
  access: ListAccessControl<BaseListTypeInfo>
): ResolvedListAccessControl {
  if (typeof access === 'function') {
    return {
      operation: {
        query: access,
        create: access,
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
      query: operation,
      create: operation,
      update: operation,
      delete: operation,
    };
  }

  return {
    operation: {
      query: operation.query ?? (() => true),
      create: operation.create ?? (() => true),
      update: operation.update ?? (() => true),
      delete: operation.delete ?? (() => true),
    },
    filter: {
      query: filter?.query ?? (() => true),
      // create: not supported
      update: filter?.update ?? (() => true),
      delete: filter?.delete ?? (() => true),
    },
    item: {
      // query: not supported
      create: item?.create ?? (() => true),
      update: item?.update ?? (() => true),
      delete: item?.delete ?? (() => true),
    },
  };
}
