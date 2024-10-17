import {
  type BaseListTypeInfo,
  type FieldHooks,
  type MaybePromise
} from '../types'

// force new syntax for built-in fields
//   and block hooks from using resolveInput, they should use GraphQL resolvers
export type InternalFieldHooks<ListTypeInfo extends BaseListTypeInfo> =
  Omit<FieldHooks<ListTypeInfo>, 'validateInput' | 'validateDelete' | 'resolveInput'>

function merge <
  R,
  A extends (r: R) => MaybePromise<void>,
  B extends (r: R) => MaybePromise<void>
> (a?: A, b?: B) {
  if (!a && !b) return undefined
  return async (args: R) => {
    await a?.(args)
    await b?.(args)
  }
}

/** @deprecated, TODO: remove in breaking change */
function resolveValidateHooks <ListTypeInfo extends BaseListTypeInfo> ({
  validate,
  validateInput,
  validateDelete
}: FieldHooks<ListTypeInfo>): Exclude<FieldHooks<ListTypeInfo>['validate'], (...args: any) => any> | undefined {
  if (!validate && !validateInput && !validateDelete) return
  return {
    create: merge(validateInput,  typeof validate === 'function' ? validate : validate?.create),
    update: merge(validateInput,  typeof validate === 'function' ? validate : validate?.update),
    delete: merge(validateDelete, typeof validate === 'function' ? validate : validate?.delete),
  }
}

export function mergeFieldHooks <ListTypeInfo extends BaseListTypeInfo> (
  builtin?: InternalFieldHooks<ListTypeInfo>,
  hooks?: FieldHooks<ListTypeInfo>,
) {
  if (hooks === undefined) return builtin
  if (builtin === undefined) return hooks

  const builtinValidate = resolveValidateHooks(builtin)
  const hooksValidate = resolveValidateHooks(hooks)
  return {
    ...hooks,
    // WARNING: beforeOperation is _after_ a user beforeOperation hook, TODO: this is align with user expectations about when "operations" happen
    //   our *Operation hooks are built-in, and should happen nearest to the database
    beforeOperation: merge(hooks.beforeOperation, builtin.beforeOperation),
    afterOperation: merge(builtin.afterOperation, hooks.afterOperation),
    validate: (builtinValidate || hooksValidate) ? {
      create: merge(builtinValidate?.create, hooksValidate?.create),
      update: merge(builtinValidate?.update, hooksValidate?.update),
      delete: merge(builtinValidate?.delete, hooksValidate?.delete)
    } : undefined,

    // TODO: remove in breaking change
    validateInput: undefined, // prevent continuation
    validateDelete: undefined, // prevent continuation
  } satisfies FieldHooks<ListTypeInfo>
}
