import { ValidationFailureError } from '../graphql-errors';
import { InitialisedList } from '../types-for-lists';
import { promiseAllRejectWithAllErrors } from '../utils';

type ValidationError = { msg: string; data: {}; internalData: {} };

type AddValidationError = (msg: string, data?: {}, internalData?: {}) => void;

export async function validationHook(
  listKey: string,
  operation: 'create' | 'update' | 'delete',
  originalInput: Record<string, string> | undefined,
  validationHook: (addValidationError: AddValidationError) => void | Promise<void>
) {
  const errors: ValidationError[] = [];

  await validationHook((msg, data = {}, internalData = {}) => {
    errors.push({ msg, data, internalData });
  });

  if (errors.length) {
    throw new ValidationFailureError({
      data: {
        messages: errors.map(e => e.msg),
        errors: errors.map(e => e.data),
        listKey,
        operation,
      },
      internalData: { errors: errors.map(e => e.internalData), data: originalInput },
    });
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
  const { operation, resolvedData, originalInput } = hookArgs;
  // Check isRequired
  await validationHook(list.listKey, operation, originalInput, addValidationError => {
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
        addValidationError(
          `Required field "${fieldKey}" is null or undefined.`,
          { resolvedData, operation, originalInput },
          {}
        );
      }
    }
  });

  // Field validation hooks
  await validationHook(list.listKey, operation, originalInput, async addValidationError => {
    await promiseAllRejectWithAllErrors(
      Object.entries(list.fields).map(async ([fieldPath, field]) => {
        // @ts-ignore
        await field.hooks.validateInput?.({ ...hookArgs, addValidationError, fieldPath });
      })
    );
  });

  // List validation hooks
  await validationHook(list.listKey, operation, originalInput, async addValidationError => {
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
  // Field validation
  await validationHook(list.listKey, 'delete', undefined, async addValidationError => {
    await promiseAllRejectWithAllErrors(
      Object.entries(list.fields).map(async ([fieldPath, field]) => {
        await field.hooks.validateDelete?.({ ...hookArgs, addValidationError, fieldPath });
      })
    );
  });

  // List validation
  await validationHook(list.listKey, 'delete', undefined, async addValidationError => {
    await list.hooks.validateDelete?.({ ...hookArgs, addValidationError });
  });
}
