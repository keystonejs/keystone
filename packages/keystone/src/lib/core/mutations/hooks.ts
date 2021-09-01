import { extensionError } from '../graphql-errors';

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
    listKey: string;
  },
  Args extends Parameters<NonNullable<List['hooks'][HookName]>>[0]
>(list: List, hookName: HookName, args: Args) {
  // Runs the before/after change/delete hooks

  // Only run field hooks on change operations if the field
  // was specified in the original input.
  let shouldRunFieldLevelHook: (fieldKey: string) => boolean;
  if (hookName === 'beforeChange' || hookName === 'afterChange') {
    const originalInputKeys = new Set(Object.keys(args.originalInput));
    shouldRunFieldLevelHook = fieldKey => originalInputKeys.has(fieldKey);
  } else {
    shouldRunFieldLevelHook = () => true;
  }

  // Field hooks
  const fieldsErrors: { error: Error; tag: string }[] = [];
  for (const [fieldPath, field] of Object.entries(list.fields)) {
    if (shouldRunFieldLevelHook(fieldPath)) {
      try {
        await field.hooks[hookName]?.({ fieldPath, ...args });
      } catch (error: any) {
        fieldsErrors.push({ error, tag: `${list.listKey}.${fieldPath}` });
      }
    }
  }
  if (fieldsErrors.length) {
    throw extensionError(hookName, fieldsErrors);
  }

  // List hooks
  try {
    await list.hooks[hookName]?.(args);
  } catch (error: any) {
    throw extensionError(hookName, [{ error, tag: list.listKey }]);
  }
}
