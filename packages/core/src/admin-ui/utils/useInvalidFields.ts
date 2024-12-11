import { useMemo } from 'react'
import type { FieldMeta } from '../../types'
import type { Value } from './'

export function useInvalidFields (
  fields: Record<string, FieldMeta>,
  item: Value
): ReadonlySet<string> {
  return useMemo(() => {
    const invalidFields = new Set<string>()

    for (const fieldPath in item) {
      const validateFn = fields[fieldPath].controller.validate
      if (!validateFn) continue

      const fieldValue = item[fieldPath]
      if (fieldValue.kind !== 'value') continue

      const valid = validateFn(fieldValue.value)
      if (valid) continue

      invalidFields.add(fieldPath)
    }
    return invalidFields
  }, [fields, item])
}
