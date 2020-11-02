import { ListMeta } from '@keystone-next/types';
import { GraphQLError } from 'graphql';
import { useMemo } from 'react';

export function useInvalidFields(
  list: ListMeta,
  value: Record<
    string,
    | {
        kind: 'error';
        errors: readonly [GraphQLError, ...GraphQLError[]];
      }
    | {
        kind: 'value';
        value: any;
      }
  >
): ReadonlySet<string> {
  return useMemo(() => {
    const invalidFields = new Set<string>();

    Object.keys(value).forEach(fieldPath => {
      const val = value[fieldPath];

      if (val.kind === 'value') {
        const validateFn = list.fields[fieldPath].controller.validate;
        if (validateFn) {
          const result = validateFn(val.value);
          if (result === false) {
            invalidFields.add(fieldPath);
          }
        }
      }
    });
    return invalidFields;
  }, [list, value]);
}
