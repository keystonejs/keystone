import { extensionError, validationFailureError } from '../graphql-errors';
import { InitialisedModel } from '../types-for-lists';

type DistributiveOmit<T, K extends keyof T> = T extends any ? Omit<T, K> : never;

type UpdateCreateHookArgs = Parameters<
  Exclude<InitialisedModel['hooks']['validateInput'], undefined>
>[0];
export async function validateUpdateCreate({
  model,
  hookArgs,
}: {
  model: InitialisedModel;
  hookArgs: DistributiveOmit<UpdateCreateHookArgs, 'addValidationError'>;
}) {
  const messages: string[] = [];

  const fieldsErrors: { error: Error; tag: string }[] = [];
  // Field validation hooks
  await Promise.all(
    Object.entries(model.fields).map(async ([fieldKey, field]) => {
      const addValidationError = (msg: string) =>
        messages.push(`${model.modelKey}.${fieldKey}: ${msg}`);
      try {
        await field.hooks.validateInput?.({ ...hookArgs, addValidationError, fieldKey });
      } catch (error: any) {
        fieldsErrors.push({
          error,
          tag: `${model.modelKey}.${fieldKey}.hooks.validateInput`,
        });
      }
    })
  );

  if (fieldsErrors.length) {
    throw extensionError('validateInput', fieldsErrors);
  }

  // Model validation hooks
  const addValidationError = (msg: string) => messages.push(`${model.modelKey}: ${msg}`);
  try {
    await model.hooks.validateInput?.({ ...hookArgs, addValidationError });
  } catch (error: any) {
    throw extensionError('validateInput', [
      { error, tag: `${model.modelKey}.hooks.validateInput` },
    ]);
  }

  if (messages.length) {
    throw validationFailureError(messages);
  }
}

type DeleteHookArgs = Parameters<
  Exclude<InitialisedModel['hooks']['validateDelete'], undefined>
>[0];
export async function validateDelete({
  list,
  hookArgs,
}: {
  list: InitialisedModel;
  hookArgs: Omit<DeleteHookArgs, 'addValidationError'>;
}) {
  const messages: string[] = [];
  const fieldsErrors: { error: Error; tag: string }[] = [];
  // Field validation
  await Promise.all(
    Object.entries(list.fields).map(async ([fieldKey, field]) => {
      const addValidationError = (msg: string) =>
        messages.push(`${list.modelKey}.${fieldKey}: ${msg}`);
      try {
        await field.hooks.validateDelete?.({ ...hookArgs, addValidationError, fieldKey });
      } catch (error: any) {
        fieldsErrors.push({ error, tag: `${list.modelKey}.${fieldKey}.hooks.validateDelete` });
      }
    })
  );
  if (fieldsErrors.length) {
    throw extensionError('validateDelete', fieldsErrors);
  }
  // List validation
  const addValidationError = (msg: string) => messages.push(`${list.modelKey}: ${msg}`);
  try {
    await list.hooks.validateDelete?.({ ...hookArgs, addValidationError });
  } catch (error: any) {
    throw extensionError('validateDelete', [
      { error, tag: `${list.modelKey}.hooks.validateDelete` },
    ]);
  }
  if (messages.length) {
    throw validationFailureError(messages);
  }
}
