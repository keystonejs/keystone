// @flow

import querystring from 'querystring';
import * as React from 'react';

import List from '../../classes/List';
// $FlowFixMe flow doesn't recognise the `*/Controller` entry point
import type { FieldControllerType } from '@keystonejs/fields/Controller';
import { pseudoLabelField } from './FieldSelect';
import type { AdminMeta } from '../../providers/AdminMeta';

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
  sortBy: SortByType,
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
  const sortBy = parseSortBy(defaultSort, props.list) || { field: fields[0], direction: 'ASC' };
  fields.unshift(pseudoLabelField);
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
  return fieldPaths
    .map(path => (path === '_label_' ? pseudoLabelField : list.fields.find(f => f.path === path)))
    .filter(f => !!f); // remove anything that was not found.
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

  const field = list.fields.find(f => f.path === key);
  if (!field) {
    return null;
  }
  return {
    field: { label: field.label, path: field.path },
    direction,
  };
};

const encodeSortBy = (sortBy: SortByType): string => {
  const {
    direction,
    field: { path },
  } = sortBy;
  return direction === 'ASC' ? path : `-${path}`;
};

const parseFilter = (filter: [string, string], list): FilterType | null => {
  const [key, value] = filter;
  let type;
  let label;
  const field = list.fields.find(f => {
    if (key.indexOf(f.path) !== 0) return false;
    const filterType = f.getFilterTypes().find(t => {
      return key === `${f.path}_${t.type}`;
    });
    if (filterType) {
      type = filterType.type;
      label = filterType.label;
      return true;
    } else {
      return false;
    }
  });

  if (!field || !type || !label) return null;

  // Try to parse the value
  let parsedValue;
  try {
    parsedValue = JSON.parse(value);
  } catch (error) {
    // If filter value is not valid JSON we ignore this filter.
    return null;
  }

  return {
    field,
    label,
    path: field.path,
    type,
    value: parsedValue,
  };
};

const encodeFilter = (filter: FilterType): [string, string] => {
  const { field, type, value } = filter;
  return [`${field.path}_${type}`, JSON.stringify(value)];
};

type Props = {
  adminMeta: AdminMeta,
  children: (*) => React.Node,
  history: Object,
  list: Object,
  location: Object,
  match: Object,
};

export const decodeSearch = (search: string, props: Props): SearchType => {
  const query = querystring.parse(search.replace('?', ''));
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

export const encodeSearch = (data: SearchType, props: Props): string => {
  const searchDefaults = getSearchDefaults(props);
  const params = Object.keys(data).reduce((acc, key) => {
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

  if (Object.keys(params).length === 0) return '';
  return '?' + querystring.stringify(params);
};
