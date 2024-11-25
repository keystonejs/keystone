import { useRouter } from 'next/router'
import { useMemo } from 'react'

import { type ListMeta } from '../../../../types'

export function useSelectedFields (
  list: ListMeta,
  fieldModesByFieldPath: Record<string, 'hidden' | 'read'>
): ReadonlySet<string> {
  const { query } = useRouter()
  const selectedFieldsFromUrl = typeof query.fields === 'string' ? query.fields : ''
  return useMemo(() => {
    const selectedFieldsArray = selectedFieldsFromUrl
      ? selectedFieldsFromUrl.split(',')
      : list.initialColumns
    const fields = selectedFieldsArray.filter(field => {
      return fieldModesByFieldPath[field] === 'read'
    })

    return new Set(fields.length === 0 ? [list.labelField] : fields)
  }, [list, selectedFieldsFromUrl, fieldModesByFieldPath])
}
