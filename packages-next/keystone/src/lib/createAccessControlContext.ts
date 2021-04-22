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

export async function validateListAccessControl({
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
