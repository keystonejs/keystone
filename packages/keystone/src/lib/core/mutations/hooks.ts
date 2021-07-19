import { promiseAllRejectWithAllErrors } from '../utils';

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
  await promiseAllRejectWithAllErrors(
    Object.entries(list.fields).map(async ([fieldKey, field]) => {
      if (shouldRunFieldLevelHook(fieldKey)) {
        await field.hooks[hookName]?.({ fieldPath: fieldKey, ...args });
      }
    })
  );

  // List hooks
  await list.hooks[hookName]?.(args);
}
