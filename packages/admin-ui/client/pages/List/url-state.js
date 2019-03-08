// @flow

import * as React from 'react';

import List from '../../classes/List';
import type { FieldControllerType } from '@keystone-alpha/fields/Controller';

export type SortByType = {
  field: { label: string, path: string },
  direction: 'ASC' | 'DESC',
};

export type FilterType = {
  field: FieldControllerType,
  label: string,
  type: string,
  value: string,
};

export type SearchType = {
  currentPage: number,
  pageSize: number,
  search: string,
  fields: Array<FieldControllerType>,
  sortBy: SortByType | null,
  filters: Array<FilterType>,
};

// ==============================
// Query string encode/decode
// ==============================

const allowedSearchParams = ['currentPage', 'pageSize', 'search', 'fields', 'sortBy', 'filters'];

const getSearchDefaults = (props: Props): SearchType => {
  const { defaultColumns, defaultSort, defaultPageSize } = props.list.adminConfig;

  // Dynamic defaults
  const fields = parseFields(defaultColumns, props.list);
  let sortBy = parseSortBy(defaultSort, props.list);
  if (!sortBy) {
    const sortableField = fields.find(field => field.isSortable());
    if (sortableField) {
      sortBy = { field: sortableField, direction: 'ASC' };
    }
  }
  return {
    currentPage: 1,
    pageSize: defaultPageSize,
    search: '',
    fields,
    sortBy,
    filters: [],
  };
};

const parseFields = (fields, list) => {
  const fieldPaths = fields.split(',');
  return (
    fieldPaths
      .map(path => list.getFieldControllers().find(f => f.path === path))
      // remove anything that was not found.
      .filter(f => !!f)
  );
};

const encodeFields = fields => {
  return fields.map(f => f.path).join(',');
};

const parseSortBy = (sortBy: string, list: List): SortByType | null => {
  let key = sortBy;
  let direction = 'ASC';

  if (sortBy.charAt(0) === '-') {
    key = sortBy.substr(1);
    direction = 'DESC';
  }

  const field = list.getFieldControllers().find(f => f.path === key);
  if (!field || !field.isSortable()) {
    return null;
  }
  return {
    field: { label: field.label, path: field.path },
    direction,
  };
};

const encodeSortBy = (sortBy: SortByType): string => {
  const { direction, field } = sortBy;
  if (!field) {
    return null;
  }
  return direction === 'ASC' ? field.path : `-${field.path}`;
};

const parseFilter = (filter: [string, string], list): FilterType | null => {
  const [key, value] = filter;
  let type;
  let label;
  const filterField = list.getFieldControllers().find(field => {
    if (key.indexOf(field.path) !== 0) return false;
    const filterType = field.getFilterTypes().find(t => {
      return key === `${field.path}_${t.type}`;
    });
    if (filterType) {
      type = filterType.type;
      label = filterType.label;
      return true;
    } else {
      return false;
    }
  });

  if (!filterField || !type || !label) return null;

  // Try to parse the value
  let parsedValue;
  try {
    parsedValue = JSON.parse(value);
  } catch (error) {
    // If filter value is not valid JSON we ignore this filter.
    return null;
  }

  return {
    field: filterField,
    label,
    path: filterField.path,
    type,
    value: parsedValue,
  };
};

const encodeFilter = (filter: FilterType): [string, string] => {
  const { field, type, value } = filter;
  return [`${field.path}_${type}`, JSON.stringify(value)];
};

type Props = {
  children: (*) => React.Node,
  history: Object,
  list: Object,
  location: Object,
};

export const decodeSearch = (query: object, props: Props): SearchType => {
  const searchDefaults = getSearchDefaults(props);
  const params = Object.keys(query).reduce((acc, key) => {
    // Remove anything that is not "allowed"
    if (!allowedSearchParams.includes(key)) return acc;

    // Each type has a different parse function.
    switch (key) {
      case 'currentPage':
        acc[key] = parseInt(query[key], 10);
        break;
      case 'pageSize':
        const { maximumPageSize } = props.list.adminConfig;
        acc[key] = Math.min(parseInt(query[key], 10), maximumPageSize);
        break;
      case 'fields':
        acc[key] = parseFields(query[key], props.list);
        break;
      case 'sortBy':
        let sortBy = parseSortBy(query[key], props.list);
        if (sortBy !== null) {
          acc[key] = sortBy;
        }
        break;
      default:
        acc[key] = query[key];
    }
    return acc;
  }, {});

  // decode filters
  params.filters = Object.keys(query).reduce((acc, key) => {
    if (key.charAt(0) !== '!') return acc;
    const filter = parseFilter([key.substr(1), query[key]], props.list);
    if (filter) acc.push(filter);
    return acc;
  }, []);

  // Dynamic defaults
  if (!(params.fields && params.fields.length)) {
    params.fields = searchDefaults.fields;
  }

  if (!params.sortBy) {
    params.sortBy = searchDefaults.sortBy;
  }

  return {
    ...searchDefaults,
    ...params,
  };
};

export const encodeSearch = (data: SearchType, props: Props): object => {
  const searchDefaults = getSearchDefaults(props);
  return Object.keys(data).reduce((acc, key) => {
    // strip anthing which matches the default (matching primitive types)
    if (data[key] === searchDefaults[key]) return acc;

    if (!allowedSearchParams.includes(key)) {
      throw new Error(`Key "${key}" is not allowed as a query param.`);
    }

    switch (key) {
      case 'fields':
        const fields = encodeFields(data[key]);
        const defaultFields = encodeFields(searchDefaults[key]);
        if (fields !== defaultFields) acc[key] = fields;
        break;
      case 'sortBy':
        const sortBy = encodeSortBy(data[key]);
        const defaultSortBy = encodeSortBy(searchDefaults[key]);
        if (sortBy !== defaultSortBy) acc[key] = sortBy;
        break;
      case 'filters':
        data[key].forEach(filter => {
          const [name, value] = encodeFilter(filter);
          acc[`!${name}`] = value;
        });
        break;
      default:
        acc[key] = data[key];
    }

    return acc;
  }, {});
};
