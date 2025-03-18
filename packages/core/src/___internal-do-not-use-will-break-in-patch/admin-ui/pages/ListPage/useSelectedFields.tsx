import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'

import { type ListMeta } from '../../../../types'

export function useSelectedFields(list: ListMeta): ReadonlySet<string> {
  const selectedFieldsFromUrl = useSearchParams().get('fields') ?? ''
  return useMemo(() => {
    const selectedFieldsArray = selectedFieldsFromUrl
      ? selectedFieldsFromUrl.split(',')
      : list.initialColumns
    const fields = selectedFieldsArray.filter(fieldKey => {
      const field = list.fields[fieldKey]
      if (!field) return false
      return field.listView.fieldMode === 'read'
    })

    return new Set(fields.length === 0 ? [list.labelField] : fields)
  }, [list, selectedFieldsFromUrl])
}
