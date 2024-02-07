import { useMemo } from 'react'
import { getInvalidFields } from './serialization'

import {
  type FieldMeta,
  type ControllerValue
} from '../../types'

export function useInvalidFields (
  fields: Record<string, FieldMeta>,
  value: ControllerValue | null
) {
  return useMemo(() => {
    if (value === null) return new Set<string>()
    return getInvalidFields(fields, value)
  }, [fields, value])
}
