import { ValidationFailureError } from '../graphql-errors';
import { promiseAllRejectWithMutationError } from '.';

type ValidationError = { msg: string; data: {} };

type AddValidationError = (msg: string, data?: {}) => void;

export async function validationHook(
  validationHook: (addValidationError: AddValidationError) => void | Promise<void>
) {
  const errors: ValidationError[] = [];

  await validationHook((msg, data = {}) => {
    errors.push({ msg, data });
  });

  if (errors.length) {
    throw ValidationFailureError({ data: { errors } });
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
  // Field hooks
  await promiseAllRejectWithMutationError(
    Object.entries(list.fields).map(async ([fieldKey, field]) => {
      if (shouldRunFieldLevelHook(fieldKey)) {
        await field.hooks[hookName]?.({ fieldPath: fieldKey, ...args });
      }
    })
  );

  // List hooks
  await list.hooks[hookName]?.(args);
}
