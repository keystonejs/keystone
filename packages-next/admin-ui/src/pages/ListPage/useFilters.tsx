import { useRouter } from '../../router';
import { useMemo } from 'react';
import { JSONValue, ListMeta } from '@keystone-next/types';

export type Filter = { field: string; type: string; value: JSONValue };

export function useFilters(list: ListMeta) {
  const { query } = useRouter();
  const possibleFilters = useMemo(() => {
    const possibleFilters: Record<string, { type: string; field: string }> = {};
    Object.entries(list.fields).forEach(([fieldPath, field]) => {
      if (field.controller.filter) {
        Object.keys(field.controller.filter.types).forEach(type => {
          possibleFilters[`!${fieldPath}_${type}`] = {
            type,
            field: fieldPath,
          };
        });
      }
    });
    return possibleFilters;
  }, [list]);
  const filters = useMemo(() => {
    let filters: Filter[] = [];
    Object.keys(query).forEach(key => {
      const filter = possibleFilters[key];
      const val = query[key];
      if (filter && typeof val === 'string') {
        let value;
        try {
          value = JSON.parse(val);
        } catch (err) {}
        if (val !== undefined) {
          filters.push({
            ...filter,
            value,
          });
        }
      }
    });

    let where = {};

    filters.forEach(filter => {
      Object.assign(
        where,
        list.fields[filter.field].controller.filter!.graphql({
          type: filter.type,
          value: filter.value,
        })
      );
    });

    return { filters, where };
  }, [query, possibleFilters, list]);
  return filters;
}
