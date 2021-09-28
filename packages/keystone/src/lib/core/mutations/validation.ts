import { validationFailureError } from '../graphql-errors';
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

  // Check isRequired
  for (const [fieldKey, field] of Object.entries(list.fields)) {
    // yes, this is a massive hack, it's just to make image and file fields work well enough
    let val = resolvedData[fieldKey];
    if (field.dbField.kind === 'multi') {
      if (Object.values(resolvedData[fieldKey]).every(x => x === null)) {
        val = null;
      }
      if (Object.values(resolvedData[fieldKey]).every(x => x === undefined)) {
        val = undefined;
      }
    }
    if (
      field.__legacy?.isRequired &&
      ((operation === 'create' && val == null) || (operation === 'update' && val === null))
    ) {
      messages.push(
        `${list.listKey}.${fieldKey}: Required field "${fieldKey}" is null or undefined.`
      );
    }
  }

  // Field validation hooks
  for (const [fieldKey, field] of Object.entries(list.fields)) {
    const addValidationError = (msg: string) =>
      messages.push(`${list.listKey}.${fieldKey}: ${msg}`);
    // @ts-ignore
    await field.hooks.validateInput?.({ ...hookArgs, addValidationError, fieldKey });
  }

  // List validation hooks
  const addValidationError = (msg: string) => messages.push(`${list.listKey}: ${msg}`);
  // @ts-ignore
  await list.hooks.validateInput?.({ ...hookArgs, addValidationError });
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

  // Field validation
  for (const [fieldKey, field] of Object.entries(list.fields)) {
    const addValidationError = (msg: string) =>
      messages.push(`${list.listKey}.${fieldKey}: ${msg}`);
    await field.hooks.validateDelete?.({ ...hookArgs, addValidationError, fieldKey });
  }

  // List validation
  const addValidationError = (msg: string) => messages.push(`${list.listKey}: ${msg}`);
  await list.hooks.validateDelete?.({ ...hookArgs, addValidationError });

  if (messages.length) {
    throw validationFailureError(messages);
  }
}
