import { useMemo } from 'react';
import { ListMeta } from '../../../../types';
import { useRouter } from '../../../../admin-ui/router';

export function useSelectedFields(
  list: ListMeta,
  fieldModesByFieldPath: Record<string, 'hidden' | 'read'>
): ReadonlySet<string> {
  const { query } = useRouter();
  const selectedFieldsFromUrl = typeof query.fields === 'string' ? query.fields : '';
  return useMemo(() => {
    let selectedFieldsArray = selectedFieldsFromUrl
      ? selectedFieldsFromUrl.split(',')
      : list.initialColumns;
    let fields = selectedFieldsArray.filter(field => {
      return fieldModesByFieldPath[field] === 'read';
    });

    return new Set(fields.length === 0 ? [list.labelField] : fields);
  }, [list, selectedFieldsFromUrl, fieldModesByFieldPath]);
}
