import { extensionError } from '../graphql-errors';

export async function runSideEffectOnlyHook<
  HookName extends string,
  Model extends {
    fields: Record<
      string,
      {
        hooks: {
          [Key in HookName]?: (args: { fieldKey: string } & Args) => Promise<void> | void;
        };
      }
    >;
    hooks: {
      [Key in HookName]?: (args: any) => Promise<void> | void;
    };
    modelKey: string;
  },
  Args extends Parameters<NonNullable<Model['hooks'][HookName]>>[0]
>(model: Model, hookName: HookName, args: Args) {
  // Runs the before/after operation hooks

  let shouldRunFieldLevelHook: (fieldKey: string) => boolean;
  if (args.operation === 'delete') {
    // Always run field hooks for delete operations
    shouldRunFieldLevelHook = () => true;
  } else {
    // Only run field hooks on if the field was specified in the
    // original input for create and update operations.
    const inputDataKeys = new Set(Object.keys(args.inputData));
    shouldRunFieldLevelHook = fieldKey => inputDataKeys.has(fieldKey);
  }

  // Field hooks
  const fieldsErrors: { error: Error; tag: string }[] = [];
  await Promise.all(
    Object.entries(model.fields).map(async ([fieldKey, field]) => {
      if (shouldRunFieldLevelHook(fieldKey)) {
        try {
          await field.hooks[hookName]?.({ fieldKey, ...args });
        } catch (error: any) {
          fieldsErrors.push({
            error,
            tag: `${model.modelKey}.${fieldKey}.hooks.${hookName}`,
          });
        }
      }
    })
  );

  if (fieldsErrors.length) {
    throw extensionError(hookName, fieldsErrors);
  }

  // Model hooks
  try {
    await model.hooks[hookName]?.(args);
  } catch (error: any) {
    throw extensionError(hookName, [{ error, tag: `${model.modelKey}.hooks.${hookName}` }]);
  }
}
