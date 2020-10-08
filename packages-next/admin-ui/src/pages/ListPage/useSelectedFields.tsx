import { useMemo } from 'react';
import { useList } from '../../context';
import { useRouter } from '../../router';

export function useSelectedFields(
  listKey: string,
  fieldModesByFieldPath: Record<string, 'hidden' | 'read'>
) {
  const list = useList(listKey);
  const { query } = useRouter();
  const selectedFieldsFromUrl = typeof query.fields === 'string' ? query.fields : '';

  return useMemo(() => {
    let selectedFieldsArray = selectedFieldsFromUrl
      ? selectedFieldsFromUrl.split(',')
      : list.initialColumns;
    let includeLabel = false;
    let fields = selectedFieldsArray.filter(field => {
      if (field === '_label_') {
        includeLabel = true;
        return false;
      }
      return fieldModesByFieldPath[field] === 'read';
    });

    return {
      fields,
      includeLabel: includeLabel || fields.length === 0,
    };
  }, [list.initialColumns, selectedFieldsFromUrl, fieldModesByFieldPath]);
}
