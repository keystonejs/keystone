import { ListMeta } from '@keystone-spike/types';
import { useMemo } from 'react';
import { useRouter } from '../../router';

export function useSelectedFields(
  list: ListMeta,
  fieldModesByFieldPath: Record<string, 'hidden' | 'read'>
) {
  const { query } = useRouter();
  const selectedFieldsFromUrl = typeof query.fields === 'string' ? query.fields : '';
  const { initialColumns } = list;
  console.log({ outer: initialColumns });
  return useMemo(() => {
    let selectedFieldsArray = selectedFieldsFromUrl
      ? selectedFieldsFromUrl.split(',')
      : initialColumns;
    console.log({ initialColumns });
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
  }, [initialColumns, selectedFieldsFromUrl, fieldModesByFieldPath]);
}
