import { extensionError, validationFailureError } from '../graphql-errors';
import { InitialisedList } from '../types-for-lists';

type DistributiveOmit<T, K extends keyof T> = T extends any ? Omit<T, K> : never;

type UpdateCreateHookArgs = Parameters<
  Exclude<InitialisedList['hooks']['validateInput'], undefined>
>[0];
export async function validateUpdateCreate({
  list,
  hookArgs,
}: {
  list: InitialisedList;
  hookArgs: DistributiveOmit<UpdateCreateHookArgs, 'addValidationError'>;
}) {
  const messages: string[] = [];

  const fieldsErrors: { error: Error; tag: string }[] = [];
  // Field validation hooks
  await Promise.all(
    Object.entries(list.fields).map(async ([fieldKey, field]) => {
      const addValidationError = (msg: string) =>
        messages.push(`${list.listKey}.${fieldKey}: ${msg}`);
      try {
        await field.hooks.validateInput?.({ ...hookArgs, addValidationError, fieldKey });
      } catch (error: any) {
        fieldsErrors.push({ error, tag: `${list.listKey}.${fieldKey}.hooks.validateInput` });
      }
    })
  );

  if (fieldsErrors.length) {
    throw extensionError('validateInput', fieldsErrors);
  }

  // List validation hooks
  const addValidationError = (msg: string) => messages.push(`${list.listKey}: ${msg}`);
  try {
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
  await Promise.all(
    Object.entries(list.fields).map(async ([fieldKey, field]) => {
      const addValidationError = (msg: string) =>
        messages.push(`${list.listKey}.${fieldKey}: ${msg}`);
      try {
        await field.hooks.validateDelete?.({ ...hookArgs, addValidationError, fieldKey });
      } catch (error: any) {
        fieldsErrors.push({ error, tag: `${list.listKey}.${fieldKey}.hooks.validateDelete` });
      }
    })
  );
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
