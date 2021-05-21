import { KeystoneContext } from '@keystone-next/types';
import { GraphQLInputObjectType } from 'graphql';
import { coerceAndValidateForGraphQLInput } from '../coerceAndValidateForGraphQLInput';
import { InputFilter } from './input-resolvers';

export async function validateNonCreateListAccessControl<
  Args extends {
    listKey: string;
    context: KeystoneContext;
    operation: 'read' | 'update' | 'delete';
  }
>({
  access,
  args,
}: {
  access: ((args: Args) => boolean | Record<string, any>) | boolean | Record<string, any>;
  args: Args;
}): Promise<InputFilter | boolean> {
  const result = typeof access === 'function' ? await access(args) : access;

  if (result === null || (typeof result !== 'object' && typeof result !== 'boolean')) {
    throw new Error(
      `Must return an object or boolean from Imperative or Declarative access control function. Got ${typeof result}`
    );
  }

  if (typeof result === 'object') {
    const internalSchema = args.context.sudo().graphql.schema;
    const whereInputType = internalSchema.getType(
      `${args.listKey}WhereInput`
    ) as GraphQLInputObjectType;
    const coercedResult = coerceAndValidateForGraphQLInput(internalSchema, whereInputType, result);
    if (coercedResult.kind === 'error') {
      throw new Error(
        `An invalid filter was provided in ${args.listKey}.access.${args.operation}: ${coercedResult.error.message}`
      );
    }
    return coercedResult.value;
  }

  return result;
}

export async function validateCreateListAccessControl<Args extends { listKey: string }>({
  access,
  args,
}: {
  access: ((args: Args) => Promise<boolean> | boolean) | boolean;
  args: Args;
}) {
  const result = typeof access === 'function' ? await access(args) : access;

  if (typeof result !== 'boolean') {
    throw new Error(
      `${
        args.listKey
      }.access.create() must return a boolean but it got a ${typeof result}. (NOTE: 'create' cannot have a Declarative access control config)`
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
