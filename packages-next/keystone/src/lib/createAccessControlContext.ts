import { KeystoneContext } from '@keystone-next/types';

type ListAccessArgs = {
  listKey: string;
  operation: string;
  session: any;
  originalInput: any;
  gqlName: string;
  itemId: any;
  itemIds: any;
  context: KeystoneContext;
};

type FieldAccessArgs = {
  listKey: string;
  operation: string;
  session: any;
  originalInput: any;
  gqlName: string;
  context: KeystoneContext;
  item: any;
  fieldKey: string;
};

async function validateListAccessControl({
  access,
  operation,
  listKey,
  ...args
}: { access: any } & ListAccessArgs) {
  // Either a boolean or an object describing a where clause
  let result;
  if (typeof access[operation] !== 'function') {
    result = access[operation];
  } else {
    result = await access[operation]({ listKey, operation, ...args });
  }

  const type = typeof result;

  if (!['object', 'boolean'].includes(type) || result === null) {
    throw new Error(
      `Must return an Object or Boolean from Imperative or Declarative access control function. Got ${type}`
    );
  }

  // Special case for 'create' permission
  if (operation === 'create' && type === 'object') {
    throw new Error(
      `Expected a Boolean for ${listKey}.access.create(), but got Object. (NOTE: 'create' cannot have a Declarative access control config)`
    );
  }

  return result;
}

async function validateFieldAccessControl({
  access,
  operation,
  listKey,
  fieldKey,
  ...args
}: { access: any } & FieldAccessArgs) {
  let result;
  if (typeof access[operation] !== 'function') {
    result = access[operation];
  } else {
    result = await access[operation]({ listKey, fieldKey, operation, ...args });
  }

  if (typeof result !== 'boolean') {
    throw new Error(
      `Must return a Boolean from ${listKey}.fields.${fieldKey}.access.${operation}(). Got ${typeof result}`
    );
  }

  return result;
}

export const skipAccessControlContext = {
  getListAccessControlForUser: () => true,
  getFieldAccessControlForUser: () => true,
};

// these are memoized in current Keystone but not here
// since it's useless because all of the callers of them pass in new objects
// + the functions will never be called with the same stuff (even ignoring the identity of the objects mentioned above)
// + the memoization library used has a cache size of 1 by default

export const accessControlContext = {
  async getListAccessControlForUser(
    access: any,
    listKey: ListAccessArgs['listKey'],
    originalInput: ListAccessArgs['originalInput'],
    operation: ListAccessArgs['operation'],
    {
      gqlName,
      itemId,
      itemIds,
      context,
    }: Pick<ListAccessArgs, 'gqlName' | 'itemId' | 'itemIds' | 'context'>
  ) {
    return validateListAccessControl({
      access: access[context.schemaName],
      originalInput,
      operation,
      session: context.session,
      listKey,
      gqlName,
      itemId,
      itemIds,
      context,
    });
  },
  async getFieldAccessControlForUser(
    access: any,
    listKey: FieldAccessArgs['listKey'],
    fieldKey: FieldAccessArgs['fieldKey'],
    originalInput: FieldAccessArgs['originalInput'],
    item: FieldAccessArgs['item'],
    operation: FieldAccessArgs['operation'],
    { gqlName, context }: Pick<FieldAccessArgs, 'gqlName' | 'context'>
  ) {
    return validateFieldAccessControl({
      access: access[context.schemaName],
      originalInput,
      item,
      operation,
      session: context.session,
      fieldKey,
      listKey,
      gqlName,
      context,
    });
  },
};
