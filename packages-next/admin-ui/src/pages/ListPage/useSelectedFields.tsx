import { useMemo } from 'react';
import { useList } from '../../KeystoneContext';
import { useRouter } from '../../router';

export function useSelectedFields(listKey: string) {
  const list = useList(listKey);
  const { query } = useRouter();
  const selectedFieldsFromUrl = typeof query.fields === 'string' ? query.fields : '';

  return useMemo(() => {
    if (!query.fields) {
      return {
        includeLabel: true,
        fields: list.initialColumns,
      };
    }
    let includeLabel = false;
    let fields = selectedFieldsFromUrl.split(',').filter(field => {
      if (field === '_label_') {
        includeLabel = true;
        return false;
      }
      return list.fields[field] !== undefined;
    });
    return {
      fields,
      includeLabel,
    };
  }, [list.initialColumns, selectedFieldsFromUrl]);
}
