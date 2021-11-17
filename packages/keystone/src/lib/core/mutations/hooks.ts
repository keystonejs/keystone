import { extensionError } from '../graphql-errors';

export async function runSideEffectOnlyHook<
  HookName extends string,
  List extends {
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
    listKey: string;
  },
  Args extends Parameters<NonNullable<List['hooks'][HookName]>>[0]
>(list: List, hookName: HookName, args: Args) {
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
    Object.entries(list.fields).map(async ([fieldKey, field]) => {
      if (shouldRunFieldLevelHook(fieldKey)) {
        try {
          await field.hooks[hookName]?.({ fieldKey, ...args });
        } catch (error: any) {
          fieldsErrors.push({ error, tag: `${list.listKey}.${fieldKey}.hooks.${hookName}` });
        }
      }
    })
  );

  if (fieldsErrors.length) {
    throw extensionError(hookName, fieldsErrors);
  }

  // List hooks
  try {
    await list.hooks[hookName]?.(args);
  } catch (error: any) {
    throw extensionError(hookName, [{ error, tag: `${list.listKey}.hooks.${hookName}` }]);
  }
}
