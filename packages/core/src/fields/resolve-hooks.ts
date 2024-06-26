import type { FieldHooks, BaseListTypeInfo } from '../types'

function splitValidateHooks <ListTypeInfo extends BaseListTypeInfo> (
  { validate, validateInput, validateDelete }: FieldHooks<ListTypeInfo>
): Exclude<FieldHooks<ListTypeInfo>["validate"], Function> | undefined {
  if (validateInput || validateDelete) {
    return {
      create: validateInput,
      update: validateInput,
      delete: validateDelete,
    }
  }

  if (!validate) return undefined 

  if (typeof validate === 'function') {
    return { create: validate, update: validate, delete: validate }
  }

  return validate
}

// force new syntax for built-in fields
// also, we don't allow built-in hooks to specify resolveInput,
// since they can do it via graphql resolvers
export type InternalFieldHooks<ListTypeInfo extends BaseListTypeInfo> = 
  Omit<FieldHooks<ListTypeInfo>, 'validateInput' | 'validateDelete' | 'resolveInput'>

/**
 * Utility function to convert deprecated field hook syntax to the new syntax
 * Handles merging any built-in field hooks into the user-provided hooks
 */
export function mergeFieldHooks <ListTypeInfo extends BaseListTypeInfo> (
  builtin?: InternalFieldHooks<ListTypeInfo>,
  hooks: FieldHooks<ListTypeInfo> = {},
): FieldHooks<ListTypeInfo> {
  if (builtin === undefined) return hooks

  const result: FieldHooks<ListTypeInfo> = {
    resolveInput: hooks?.resolveInput,
  }

  if (hooks.beforeOperation || builtin.beforeOperation) {
    result.beforeOperation = async (args) => {
      await hooks.beforeOperation?.(args)
      await builtin.beforeOperation?.(args)
    }
  }

  if (hooks.afterOperation || builtin.afterOperation) {
    result.afterOperation = async (args) => {
      await hooks.afterOperation?.(args)
      await builtin.afterOperation?.(args)
    }
  }

  const builtinValidate = splitValidateHooks(builtin)
  const fieldValidate = splitValidateHooks(hooks)

  if (builtinValidate || fieldValidate) {
    result.validate = {
      create: async (args) => {
        await builtinValidate?.create?.(args)
        await fieldValidate?.create?.(args)
      },
      update: async (args) => {
        await builtinValidate?.update?.(args)
        await fieldValidate?.update?.(args)
      },
      delete: async (args) => {
        await builtinValidate?.delete?.(args)
        await fieldValidate?.delete?.(args)
      },
    }
  }

  return result
}
