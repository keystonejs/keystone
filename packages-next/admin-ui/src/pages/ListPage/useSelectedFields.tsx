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
    if (!query.fields) {
      return {
        includeLabel: true,
        fields: list.initialColumns.filter(
          fieldPath => fieldModesByFieldPath[fieldPath] === 'read'
        ),
      };
    }
    let includeLabel = false;
    let fields = selectedFieldsFromUrl.split(',').filter(field => {
      if (field === '_label_') {
        includeLabel = true;
        return false;
      }
      return fieldModesByFieldPath[field] === 'read';
    });
    return {
      fields,
      includeLabel,
    };
  }, [list.initialColumns, selectedFieldsFromUrl, fieldModesByFieldPath]);
}
