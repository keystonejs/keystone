import { ListMeta } from '@keystone-next/types';
import { useMemo } from 'react';
import { Value } from '.';

export function useInvalidFields(list: ListMeta, value: Value): ReadonlySet<string> {
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
