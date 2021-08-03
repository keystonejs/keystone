import { validationFailureError } from '../graphql-errors';
import { InitialisedList } from '../types-for-lists';

type AddValidationError = (msg: string) => void;

async function validationHook(
  _validationHook: (addValidationError: AddValidationError) => void | Promise<void>
) {
  const messages: string[] = [];

  await _validationHook(msg => {
    messages.push(msg);
  });

  if (messages.length) {
    throw validationFailureError(messages);
  }
}

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
  await validationHook(async _addValidationError => {
    // Check isRequired
    for (const [fieldKey, field] of Object.entries(list.fields)) {
      const addValidationError = (msg: string) =>
        _addValidationError(`${list.listKey}.${fieldKey}: ${msg}`);
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
        addValidationError(`Required field "${fieldKey}" is null or undefined.`);
      }
    }

    // Field validation hooks
    for (const [fieldPath, field] of Object.entries(list.fields)) {
      const addValidationError = (msg: string) =>
        _addValidationError(`${list.listKey}.${fieldPath}: ${msg}`);
      // @ts-ignore
      await field.hooks.validateInput?.({ ...hookArgs, addValidationError, fieldPath });
    }

    // List validation hooks
    const addValidationError = (msg: string) => _addValidationError(`${list.listKey}: ${msg}`);
    // @ts-ignore
    await list.hooks.validateInput?.({ ...hookArgs, addValidationError });
  });
}

type DeleteHookArgs = Parameters<Exclude<InitialisedList['hooks']['validateDelete'], undefined>>[0];
export async function validateDelete({
  list,
  hookArgs,
}: {
  list: InitialisedList;
  hookArgs: Omit<DeleteHookArgs, 'addValidationError'>;
}) {
  await validationHook(async _addValidationError => {
    // Field validation
    for (const [fieldPath, field] of Object.entries(list.fields)) {
      const addValidationError = (msg: string) =>
        _addValidationError(`${list.listKey}.${fieldPath}: ${msg}`);
      await field.hooks.validateDelete?.({ ...hookArgs, addValidationError, fieldPath });
    }

    // List validation
    const addValidationError = (msg: string) => _addValidationError(`${list.listKey}: ${msg}`);
    await list.hooks.validateDelete?.({ ...hookArgs, addValidationError });
  });
}
