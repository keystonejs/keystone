import { useMemo } from 'react';
import { ListMeta } from '../../../../types';
import { useRouter } from '../../../../admin-ui/router';

export function useSort(list: ListMeta, orderableFields: Set<string>) {
  const { query } = useRouter();
  let sortByFromUrl = typeof query.sortBy === 'string' ? query.sortBy : '';

  return useMemo(() => {
    if (sortByFromUrl === '') {
      if (!list.initialSort || !orderableFields.has(list.initialSort.field)) {
        return null;
      }
      return list.initialSort;
    }
    let direction: 'ASC' | 'DESC' = 'ASC';
    let sortByField = sortByFromUrl;
    if (sortByFromUrl.charAt(0) === '-') {
      sortByField = sortByFromUrl.substr(1);
      direction = 'DESC';
    }
    if (!orderableFields.has(sortByField)) return null;
    return { field: sortByField, direction };
  }, [sortByFromUrl, list, orderableFields]);
}
