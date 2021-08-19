import { useMemo } from 'react';
import { ListMeta } from '../../../../types';
import { useRouter } from '../../../../admin-ui/router';

export function useSort(list: ListMeta) {
  const { query } = useRouter();
  let sortByFromUrl = typeof query.sortBy === 'string' ? query.sortBy : '';

  return useMemo(() => {
    if (sortByFromUrl === '') return list.initialSort;
    let direction: 'ASC' | 'DESC' = 'ASC';
    let sortByField = sortByFromUrl;
    if (sortByFromUrl.charAt(0) === '-') {
      sortByField = sortByFromUrl.substr(1);
      direction = 'DESC';
    }
    if (!list.fields[sortByField].isOrderable) return null;
    return {
      field: sortByField,
      direction,
    };
  }, [sortByFromUrl, list]);
}
