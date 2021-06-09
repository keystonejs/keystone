import { ValidationFailureError } from '../graphql-errors';
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

export async function runSideEffectOnlyHook<
  HookName extends string,
  List extends {
    fields: Record<
      string,
      {
        hooks: {
          [Key in HookName]?: (args: { fieldPath: string } & Args) => Promise<void> | void;
        };
      }
    >;
    hooks: {
      [Key in HookName]?: (args: any) => Promise<void> | void;
    };
  },
  Args extends Parameters<NonNullable<List['hooks'][HookName]>>[0]
>(
  list: List,
  hookName: HookName,
  args: Args,
  shouldRunFieldLevelHook: (fieldKey: string) => boolean
) {
  await promiseAllRejectWithAllErrors(
    Object.entries(list.fields).map(async ([fieldKey, field]) => {
      if (shouldRunFieldLevelHook(fieldKey)) {
        await field.hooks[hookName]?.({ fieldPath: fieldKey, ...args });
      }
    })
  );
  await list.hooks[hookName]?.(args);
}
