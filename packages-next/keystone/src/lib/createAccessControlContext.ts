import { KeystoneContext } from '@keystone-next/types';

async function validateListAccessControl({
  access,
  listKey,
  operation,
  session,
  originalInput,
  gqlName,
  itemId,
  itemIds,
  context,
}: {
  access: any;
  listKey: string;
  operation: string;
  session: any;
  originalInput: any;
  gqlName: string;
  itemId: any;
  itemIds: any;
  context: KeystoneContext;
}) {
  // Either a boolean or an object describing a where clause
  let result;
  if (typeof access[operation] !== 'function') {
    result = access[operation];
  } else {
    result = await access[operation]({
      session,
      listKey,
      operation,
      originalInput,
      gqlName,
      itemId,
      itemIds,
      context,
    });
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
  listKey,
  fieldKey,
  originalInput,
  item,
  operation,
  session,
  gqlName,
  itemId,
  itemIds,
  context,
}: {
  access: any;
  listKey: string;
  operation: string;
  session: any;
  originalInput: any;
  gqlName: string;
  itemId: any;
  itemIds: any;
  context: KeystoneContext;
  item: any;
  fieldKey: any;
}) {
  let result;
  if (typeof access[operation] !== 'function') {
    result = access[operation];
  } else {
    result = await access[operation]({
      session,
      listKey,
      fieldKey,
      originalInput,
      item,
      operation,
      gqlName,
      itemId,
      itemIds,
      context,
    });
  }

  if (typeof result !== 'boolean') {
    throw new Error(
      `Must return a Boolean from ${listKey}.fields.${fieldKey}.access.${operation}(). Got ${typeof result}`
    );
  }

  return result;
}

// getCustomAccessControlForUser and getAuthAccessControlForUser do not exist here
// since the places where they're used are not used in the new interfaces

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
    listKey: any,
    originalInput: any,
    operation: any,
    { gqlName, itemId, itemIds, context }: any = {}
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
    listKey: any,
    fieldKey: any,
    originalInput: any,
    item: any,
    operation: any,
    { gqlName, itemId, itemIds, context }: any = {}
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
      itemId,
      itemIds,
      context,
    });
  },
};
