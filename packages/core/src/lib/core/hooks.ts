import { extensionError, validationFailureError } from './graphql-errors.ts'
import type { InitialisedField, InitialisedList } from './initialise-lists.ts'

export async function validate({
  list,
  hookArgs,
}: {
  list: InitialisedList
  hookArgs: Omit<
    Parameters<InitialisedList['hooks']['validate']['create' | 'update' | 'delete']>[0],
    'addValidationError'
  >
}) {
  const messages: string[] = []
  const fieldsErrors: { error: Error; tag: string }[] = []
  const { operation } = hookArgs

  // field validation hooks
  await Promise.all(
    Object.entries(list.fields).map(async ([fieldKey, field]) => {
      const addValidationError = (msg: string) =>
        void messages.push(`${list.listKey}.${fieldKey}: ${msg}`)
      const hook = field.hooks.validate[operation]

      try {
        await hook({
          ...hookArgs,
          addValidationError,
          fieldKey,
          itemField: hookArgs.item?.[fieldKey],
          inputFieldData: hookArgs.inputData?.[fieldKey],
          resolvedFieldData: hookArgs.resolvedData?.[fieldKey],
        } as never) // TODO: FIXME
      } catch (error: any) {
        fieldsErrors.push({ error, tag: `${list.listKey}.${fieldKey}.hooks.validateInput` })
      }
    })
  )

  if (fieldsErrors.length) {
    throw extensionError('validateInput', fieldsErrors)
  }

  // list validation hooks
  {
    const addValidationError = (msg: string) => void messages.push(`${list.listKey}: ${msg}`)
    const hook = list.hooks.validate[operation]

    try {
      await hook({ ...hookArgs, addValidationError } as never) // TODO: FIXME
    } catch (error: any) {
      throw extensionError('validateInput', [{ error, tag: `${list.listKey}.hooks.validateInput` }])
    }

    if (messages.length) {
      throw validationFailureError(messages)
    }
  }
}

type SideEffectHooks = {
  beforeOperation: InitialisedList['hooks']['beforeOperation']
  afterOperation: InitialisedList['hooks']['afterOperation']
  'transaction.afterCommit': NonNullable<InitialisedList['hooks']['transaction']>['afterCommit']
  'transaction.afterRollback': NonNullable<InitialisedList['hooks']['transaction']>['afterRollback']
}

function getSideEffectHook(
  hooks: InitialisedList['hooks'] | InitialisedField['hooks'],
  name: keyof SideEffectHooks,
  operation: 'create' | 'update' | 'delete'
) {
  if (name === 'transaction.afterCommit') return hooks.transaction?.afterCommit[operation]
  if (name === 'transaction.afterRollback') return hooks.transaction?.afterRollback[operation]
  return hooks[name][operation]
}

export async function runSideEffectOnlyHook<
  HookName extends keyof SideEffectHooks,
  Args extends Parameters<SideEffectHooks[HookName]['create' | 'update' | 'delete']>[0],
>(list: InitialisedList, hookName: HookName, args: Args) {
  const { operation } = args
  const isTransactionHook =
    hookName === 'transaction.afterCommit' || hookName === 'transaction.afterRollback'

  let shouldRunFieldLevelHook: (fieldKey: string) => boolean
  if (operation === 'delete') {
    // always run field hooks for delete operations
    shouldRunFieldLevelHook = () => true
  } else {
    // only run field hooks on if the field was specified in the
    //   original input for create and update operations.
    const inputDataKeys = new Set(Object.keys(args.inputData))
    shouldRunFieldLevelHook = fieldKey => inputDataKeys.has(fieldKey)
  }

  // field hooks
  const hookErrors: { error: Error; tag: string }[] = []
  await Promise.all(
    Object.entries(list.fields).map(async ([fieldKey, field]) => {
      if (shouldRunFieldLevelHook(fieldKey)) {
        try {
          const hook = getSideEffectHook(field.hooks, hookName, operation)
          await hook?.({
            ...args,
            fieldKey,
            itemField: args.item?.[fieldKey],
            inputFieldData: args.inputData?.[fieldKey],
            resolvedFieldData: args.resolvedData?.[fieldKey],
            originalItemField: (args as any).originalItem?.[fieldKey],
          } as any) // TODO: FIXME any
        } catch (error: any) {
          if (isTransactionHook && !(error instanceof Error)) {
            error = new Error(String(error))
          }
          hookErrors.push({ error, tag: `${list.listKey}.${fieldKey}.hooks.${hookName}` })
        }
      }
    })
  )

  // Settlement callbacks are all attempted, including the list hook after field failures.
  // Keep the existing short-circuit behavior for beforeOperation and afterOperation.
  if (hookErrors.length && !isTransactionHook) {
    throw extensionError(hookName, hookErrors)
  }

  // list hooks
  try {
    await getSideEffectHook(list.hooks, hookName, operation)?.(args as any) // TODO: FIXME any
  } catch (error: any) {
    if (isTransactionHook && !(error instanceof Error)) {
      error = new Error(String(error))
    }
    hookErrors.push({ error, tag: `${list.listKey}.hooks.${hookName}` })
  }

  if (hookErrors.length) {
    throw extensionError(hookName, hookErrors)
  }
}
