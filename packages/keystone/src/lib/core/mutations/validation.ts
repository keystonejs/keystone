import { extensionError, validationFailureError } from '../graphql-errors';
import { InitialisedList } from '../types-for-lists';

type UpdateCreateHookArgs = Parameters<
  Exclude<InitialisedList['hooks']['validateInput'], undefined>
>[0];
export async function validateUpdateCreate({
  list,
  hookArgs,
}: {
  list: InitialisedList;
  hookArgs: Omit<UpdateCreateHookArgs, 'addValidationError'>;
}) {
  const { operation, resolvedData } = hookArgs;
  const messages: string[] = [];

  const fieldsErrors: { error: Error; tag: string }[] = [];
  // Field validation hooks
  for (const [fieldKey, field] of Object.entries(list.fields)) {
    const addValidationError = (msg: string) =>
      messages.push(`${list.listKey}.${fieldKey}: ${msg}`);
    try {
      // @ts-ignore
      await field.hooks.validateInput?.({ ...hookArgs, addValidationError, fieldKey });
    } catch (error: any) {
      fieldsErrors.push({ error, tag: `${list.listKey}.${fieldKey}.hooks.validateInput` });
    }
  }
  if (fieldsErrors.length) {
    throw extensionError('validateInput', fieldsErrors);
  }

  // List validation hooks
  const addValidationError = (msg: string) => messages.push(`${list.listKey}: ${msg}`);
  try {
    // @ts-ignore
    await list.hooks.validateInput?.({ ...hookArgs, addValidationError });
  } catch (error: any) {
    throw extensionError('validateInput', [{ error, tag: `${list.listKey}.hooks.validateInput` }]);
  }

  if (messages.length) {
    throw validationFailureError(messages);
  }
}

type DeleteHookArgs = Parameters<Exclude<InitialisedList['hooks']['validateDelete'], undefined>>[0];
export async function validateDelete({
  list,
  hookArgs,
}: {
  list: InitialisedList;
  hookArgs: Omit<DeleteHookArgs, 'addValidationError'>;
}) {
  const messages: string[] = [];
  const fieldsErrors: { error: Error; tag: string }[] = [];
  // Field validation
  for (const [fieldKey, field] of Object.entries(list.fields)) {
    const addValidationError = (msg: string) =>
      messages.push(`${list.listKey}.${fieldKey}: ${msg}`);
    try {
      await field.hooks.validateDelete?.({ ...hookArgs, addValidationError, fieldKey });
    } catch (error: any) {
      fieldsErrors.push({ error, tag: `${list.listKey}.${fieldKey}.hooks.validateDelete` });
    }
  }
  if (fieldsErrors.length) {
    throw extensionError('validateDelete', fieldsErrors);
  }
  // List validation
  const addValidationError = (msg: string) => messages.push(`${list.listKey}: ${msg}`);
  try {
    await list.hooks.validateDelete?.({ ...hookArgs, addValidationError });
  } catch (error: any) {
    throw extensionError('validateDelete', [
      { error, tag: `${list.listKey}.hooks.validateDelete` },
    ]);
  }
  if (messages.length) {
    throw validationFailureError(messages);
  }
}
