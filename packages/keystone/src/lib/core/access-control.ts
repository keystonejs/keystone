import { GraphQLInputObjectType } from 'graphql';
import {
  BaseGeneratedListTypes,
  CreateAccessControl,
  DeleteListAccessControl,
  FieldAccessControl,
  FieldCreateAccessArgs,
  FieldReadAccessArgs,
  FieldUpdateAccessArgs,
  IndividualFieldAccessControl,
  KeystoneContext,
  ListAccessControl,
  ReadListAccessControl,
  UpdateListAccessControl,
} from '../../types';
import { coerceAndValidateForGraphQLInput } from '../coerceAndValidateForGraphQLInput';
import { InputFilter } from './where-inputs';

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

export function parseFieldAccessControl(
  access: FieldAccessControl<BaseGeneratedListTypes> | undefined
): ResolvedFieldAccessControl {
  if (typeof access === 'boolean' || typeof access === 'function') {
    return { create: access, read: access, update: access };
  }
  // note i'm intentionally not using spread here because typescript can't express an optional property which cannot be undefined so spreading would mean there is a possibility that someone could pass {access: undefined} or {access:{read: undefined}} and bad things would happen
  return {
    create: access?.create ?? true,
    read: access?.read ?? true,
    update: access?.update ?? true,
  };
}

export type ResolvedFieldAccessControl = {
  read: IndividualFieldAccessControl<FieldReadAccessArgs<BaseGeneratedListTypes>>;
  create: IndividualFieldAccessControl<FieldCreateAccessArgs<BaseGeneratedListTypes>>;
  update: IndividualFieldAccessControl<FieldUpdateAccessArgs<BaseGeneratedListTypes>>;
};

export function parseListAccessControl(
  access: ListAccessControl<BaseGeneratedListTypes> | undefined
): ResolvedListAccessControl {
  if (typeof access === 'boolean' || typeof access === 'function') {
    return { create: access, read: access, update: access, delete: access };
  }
  // note i'm intentionally not using spread here because typescript can't express an optional property which cannot be undefined so spreading would mean there is a possibility that someone could pass {access: undefined} or {access:{read: undefined}} and bad things would happen
  return {
    create: access?.create ?? true,
    read: access?.read ?? true,
    update: access?.update ?? true,
    delete: access?.delete ?? true,
  };
}

export type ResolvedListAccessControl = {
  read: ReadListAccessControl<BaseGeneratedListTypes>;
  create: CreateAccessControl<BaseGeneratedListTypes>;
  update: UpdateListAccessControl<BaseGeneratedListTypes>;
  delete: DeleteListAccessControl<BaseGeneratedListTypes>;
};
