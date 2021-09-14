import {
  BaseGeneratedListTypes,
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
} from '../../types';
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
  // @ts-ignore
  const result = await access(args);

  const resultType = typeof result;

  // It's important that we don't cast objects to truthy values, as there's a strong chance that the user
  // has accidentally tried to return a filter.
  if (resultType !== 'boolean') {
    throw new Error(
      `Must return a Boolean from ${args.listKey}.access.operation.${args.operation}(). Got ${resultType}`
    );
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
  // @ts-ignore
  return typeof access === 'function' ? await access(args) : access;
}

export async function validateFieldAccessControl<
  Args extends { listKey: string; fieldKey: string; operation: 'read' | 'create' | 'update' }
>({
  access,
  args,
}: {
  access: ((args: Args) => boolean | Promise<boolean>) | boolean;
  args: Args;
}) {
  let result = typeof access === 'function' ? await access(args) : access;
  if (typeof result !== 'boolean') {
    throw new Error(
      `Must return a Boolean from ${args.listKey}.fields.${args.fieldKey}.access.${
        args.operation
      }(). Got ${typeof result}`
    );
  }
  return result;
}

export function parseFieldAccessControl(
  access: FieldAccessControl<BaseGeneratedListTypes> | undefined
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
  read: IndividualFieldAccessControl<FieldReadItemAccessArgs<BaseGeneratedListTypes>>;
  create: IndividualFieldAccessControl<FieldCreateItemAccessArgs<BaseGeneratedListTypes>>;
  update: IndividualFieldAccessControl<FieldUpdateItemAccessArgs<BaseGeneratedListTypes>>;
};

export function parseListAccessControl(
  access: ListAccessControl<BaseGeneratedListTypes> | undefined
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
    create: ListOperationAccessControl<'create'>;
    query: ListOperationAccessControl<'query'>;
    update: ListOperationAccessControl<'update'>;
    delete: ListOperationAccessControl<'delete'>;
  };
  filter: {
    // create: not supported
    query: ListFilterAccessControl<'query', BaseGeneratedListTypes>;
    update: ListFilterAccessControl<'update', BaseGeneratedListTypes>;
    delete: ListFilterAccessControl<'delete', BaseGeneratedListTypes>;
  };
  item: {
    create: CreateListItemAccessControl<BaseGeneratedListTypes>;
    // query: not supported
    update: UpdateListItemAccessControl<BaseGeneratedListTypes>;
    delete: DeleteListItemAccessControl<BaseGeneratedListTypes>;
  };
};
