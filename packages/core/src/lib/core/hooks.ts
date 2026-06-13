import { extensionError, validationFailureError } from './graphql-errors'
import { type InitialisedList } from './initialise-lists'

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
        fieldsErrors.push({ error, tag: `${list.listKey}.${fieldKey}.hooks.validate` })
      }
    })
  )

  if (fieldsErrors.length) {
    throw extensionError('validate', fieldsErrors)
  }

  // list validation hooks
  {
    const addValidationError = (msg: string) => void messages.push(`${list.listKey}: ${msg}`)
    const hook = list.hooks.validate[operation]

    let listHookError: any
    try {
      await hook({ ...hookArgs, addValidationError } as never) // TODO: FIXME
    } catch (error: any) {
      listHookError = error
    }

    if (messages.length) {
      throw validationFailureError(messages)
    }

    if (listHookError) {
      throw extensionError('validate', [{ error: listHookError, tag: `${list.listKey}.hooks.validate` }])
    }
  }
}

export async function runSideEffectAndHandleErrors(
  hookName: 'beforeOperation' | 'afterOperation',
  list: InitialisedList,
  operation: 'create' | 'update' | 'delete',
  args: any
) {
  const fieldErrors: { error: Error; tag: string }[] = []
  await Promise.all(
    Object.entries(list.fields).map(async ([fieldKey, field]) => {
      const hook = field.hooks[hookName][operation]
      try {
        await (hook as any)({ ...args, fieldKey })
      } catch (error: any) {
        fieldErrors.push({ error, tag: `${list.listKey}.${fieldKey}.hooks.${hookName}` })
      }
    })
  )

  if (fieldErrors.length) {
    throw extensionError(hookName, fieldErrors)
  }

  try {
    await (list.hooks[hookName][operation] as any)(args)
  } catch (error: any) {
    throw extensionError(hookName, [{ error, tag: `${list.listKey}.hooks.${hookName}` }])
  }
}
