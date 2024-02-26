import { extensionError, validationFailureError } from './graphql-errors'
import { type InitialisedList } from './initialise-lists'

export async function validate ({
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
  const fieldsErrors: { error: Error, tag: string }[] = []
  const { operation } = hookArgs

  // field validation hooks
  await Promise.all(
    Object.entries(list.fields).map(async ([fieldKey, field]) => {
      const addValidationError = (msg: string) => void messages.push(`${list.listKey}.${fieldKey}: ${msg}`)
      const hook = field.hooks.validate[operation]

      try {
        await hook({ ...hookArgs, addValidationError, fieldKey } as never) // TODO: FIXME
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
      throw extensionError('validateInput', [
        { error, tag: `${list.listKey}.hooks.validateInput` }
      ])
    }

    if (messages.length) {
      throw validationFailureError(messages)
    }
  }
}

export async function runSideEffectOnlyHook<
  HookName extends 'beforeOperation' | 'afterOperation',
  Args extends Parameters<
    NonNullable<InitialisedList['hooks'][HookName]['create' | 'update' | 'delete']>
  >[0]
> (list: InitialisedList, hookName: HookName, args: Args) {
  const { operation } = args

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
  const fieldsErrors: { error: Error, tag: string }[] = []
  await Promise.all(
    Object.entries(list.fields).map(async ([fieldKey, field]) => {
      if (shouldRunFieldLevelHook(fieldKey)) {
        try {
          await field.hooks[hookName][operation]({ fieldKey, ...args } as any) // TODO: FIXME any
        } catch (error: any) {
          fieldsErrors.push({ error, tag: `${list.listKey}.${fieldKey}.hooks.${hookName}` })
        }
      }
    })
  )

  if (fieldsErrors.length) {
    throw extensionError(hookName, fieldsErrors)
  }

  // list hooks
  try {
    await list.hooks[hookName][operation](args as any) // TODO: FIXME any
  } catch (error: any) {
    throw extensionError(hookName, [{ error, tag: `${list.listKey}.hooks.${hookName}` }])
  }
}
