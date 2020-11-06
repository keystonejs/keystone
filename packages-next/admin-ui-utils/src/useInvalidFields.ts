import { FieldMeta } from '@keystone-next/types';
import { useMemo } from 'react';
import { Value } from './item-form';

export function useInvalidFields(
  fields: Record<string, FieldMeta>,
  value: Value
): ReadonlySet<string> {
  return useMemo(() => {
    const invalidFields = new Set<string>();

    Object.keys(value).forEach(fieldPath => {
      const val = value[fieldPath];

      if (val.kind === 'value') {
        const validateFn = fields[fieldPath].controller.validate;
        if (validateFn) {
          const result = validateFn(val.value);
          if (result === false) {
            invalidFields.add(fieldPath);
          }
        }
      }
    });
    return invalidFields;
  }, [fields, value]);
}
