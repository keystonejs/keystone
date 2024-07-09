import {
  type BaseListTypeInfo,
  type FieldHooks,
  type MaybePromise
} from '../types'

// force new syntax for built-in fields
//   and block hooks from using resolveInput, they should use GraphQL resolvers
export type InternalFieldHooks<ListTypeInfo extends BaseListTypeInfo> =
  Omit<FieldHooks<ListTypeInfo>, 'validateInput' | 'validateDelete' | 'resolveInput'>

/** @deprecated, TODO: remove in breaking change */
function resolveValidateHooks <ListTypeInfo extends BaseListTypeInfo> ({
  validate,
  validateInput,
  validateDelete
}: FieldHooks<ListTypeInfo>): Exclude<FieldHooks<ListTypeInfo>["validate"], Function> | undefined {
  if (validateInput || validateDelete) {
    return {
      create: validateInput,
      update: validateInput,
      delete: validateDelete,
    }
  }

  if (!validate) return
  if (typeof validate === 'function') {
    return {
      create: validate,
      update: validate,
      delete: validate
    }
  }

  return validate
}

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
  } satisfies FieldHooks<ListTypeInfo>
}
