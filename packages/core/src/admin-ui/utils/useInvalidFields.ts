import { useMemo } from 'react'
import type { FieldMeta } from '../../types'

export function useInvalidFields (
  fields: Record<string, FieldMeta>,
  item: Record<string, unknown>
): ReadonlySet<string> {
  return useMemo(() => {
    const invalidFields = new Set<string>()

    for (const fieldPath in item) {
      const validateFn = fields[fieldPath]?.controller?.validate
      if (!validateFn) continue

      const fieldValue = item[fieldPath]
      const valid = validateFn(fieldValue)
      if (valid) continue

      invalidFields.add(fieldPath)
    }
    return invalidFields
  }, [fields, item])
}
