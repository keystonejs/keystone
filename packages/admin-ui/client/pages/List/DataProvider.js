// @flow
import * as React from 'react';
import { Component, Fragment } from 'react';
import gql from 'graphql-tag';
import querystring from 'querystring';
import debounce from 'lodash.debounce';
import { Query } from 'react-apollo';
import { withRouter } from 'react-router-dom';

import Nav from '../../components/Nav';
import DocTitle from '../../components/DocTitle';
import PageError from '../../components/PageError';
import { deconstructErrorsToDataShape } from '../../util';
import { pseudoLabelField } from './FieldSelect';
import type { AdminMeta } from '../../Providers/AdminMeta';
import List from '../../classes/List';
import type { FieldControllerType } from '@voussoir/fields/Controller';

export type SortByType = {
  field: { label: string, path: string },
  direction: 'ASC' | 'DESC',
};

type Filter = {
  field: FieldControllerType,
  label: string,
  type: string,
  value: string,
};

type Search = {
  currentPage: number,
  pageSize: number,
  search: string,
  fields: Array<FieldControllerType>,
  sortBy: SortByType,
  filters: Array<Filter>,
};

const getQueryArgs = ({ filters, ...args }) => {
  const queryArgs = Object.keys(args).map(
    // Using stringify to get the correct quotes depending on type
    argName => `${argName}: ${JSON.stringify(args[argName])}`
  );
  if (filters) {
    const filterArgs = filters.map(filter => filter.field.getFilterGraphQL(filter));
    if (filterArgs.length) {
      queryArgs.push(`where: { ${filterArgs.join(', ')} }`);
    }
  }
  return queryArgs.length ? `(${queryArgs.join(' ')})` : '';
};

const getQuery = ({ fields, filters, list, search, orderBy, skip, first }) => {
  const queryArgs = getQueryArgs({ first, filters, search, skip, orderBy });
  const metaQueryArgs = getQueryArgs({ filters, search });
  const safeFields = fields.filter(field => field.path !== '_label_');
  return gql`{
    ${list.gqlNames.listQueryName}${queryArgs} {
      id
      _label_
      ${safeFields.map(field => field.getQueryFragment()).join('\n')}
    }
    _${list.gqlNames.listQueryName}Meta${metaQueryArgs} {
      count
    }
  }`;
};

// ==============================
// Query string encode/decode
// ==============================

const allowedSearchParams = ['currentPage', 'pageSize', 'search', 'fields', 'sortBy', 'filters'];

const getSearchDefaults = (props: Props): Search => {
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
  if (!field) return null;

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

const parseFilter = (filter: [string, string], list): Filter | null => {
  const [key, value] = filter;
  let type;
  let label;
  const field = list.fields.find(f => {
    if (key.indexOf(f.path) !== 0) return false;
    const filterType = f.filterTypes.find(t => {
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

  if (!field) return null;

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

const encodeFilter = (filter: Filter): [string, string] => {
  const { field, type, value } = filter;
  return [`${field.path}_${type}`, JSON.stringify(value)];
};

const decodeSearch = (search: string, props: Props): Search => {
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
        acc[key] = parseSortBy(query[key], props.list);
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

const encodeSearch = (data: Search, props: Props): string => {
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

type Props = {
  list: Object,
  match: Object,
  location: Object,
  history: Object,
  adminMeta: AdminMeta,
  children: (*) => React.Node,
};

type State = {};

class ListPageDataProvider extends Component<Props, State> {
  constructor(props) {
    super(props);
    const maybePersistedSearch = this.props.list.getPersistedSearch();
    if (this.props.location.search) {
      if (this.props.location.search !== maybePersistedSearch) {
        this.props.list.setPersistedSearch(this.props.location.search);
      }
    } else if (maybePersistedSearch) {
      this.props.history.replace({
        ...this.props.location,
        search: maybePersistedSearch,
      });
    }

    // We record the number of items returned by the latest query so that the
    // previous count can be displayed during a loading state.
    this.itemsCount = 0;
  }

  // ==============================
  // Search
  // ==============================

  handleSearchChange = debounce(newSearch => {
    const { location } = this.props;
    const { search } = decodeSearch(location.search, this.props);
    const addHistoryRecord = !search;
    this.setSearch({ search: newSearch }, addHistoryRecord);
  }, 300);
  handleSearchClear = () => {
    const { location } = this.props;
    const { search } = decodeSearch(location.search, this.props);
    const addHistoryRecord = !!search;
    this.setSearch({ search: '' }, addHistoryRecord);
  };
  handleSearchSubmit = () => {
    const { history, match } = this.props;
    // FIXME: This seems likely to do the wrong thing if data is not yet loaded.
    if (this.items.length === 1) {
      history.push(`${match.url}/${this.items[0].id}`);
    }
  };

  // ==============================
  // Filters
  // ==============================

  handleFilterRemove = value => () => {
    const { filters } = decodeSearch(location.search, this.props);
    const newFilters = filters.filter(f => {
      return !(f.field.path === value.field.path && f.type === value.type);
    });
    this.setSearch({ filters: newFilters });
  };
  handleFilterRemoveAll = () => {
    this.setSearch({ filters: [] });
  };
  handleFilterAdd = value => {
    const { location } = this.props;
    const { filters } = decodeSearch(location.search, this.props);
    filters.push(value);
    this.setSearch({ filters });
  };
  handleFilterUpdate = updatedFilter => {
    const { location } = this.props;
    const { filters } = decodeSearch(location.search, this.props);

    const updateIndex = filters.findIndex(i => {
      return i.field.path === updatedFilter.field.path && i.type === updatedFilter.type;
    });

    filters.splice(updateIndex, 1, updatedFilter);
    this.setSearch({ filters });
  };

  // ==============================
  // Columns
  // ==============================

  handleFieldChange = selectedFields => {
    const { list, location } = this.props;

    // Ensure that the displayed fields maintain their original sortDirection
    // when they're added/removed
    const fields = [pseudoLabelField]
      .concat(list.fields)
      .filter(field => selectedFields.some(selectedField => selectedField.path === field.path));

    // Reset `sortBy` if we were ordering by a field which has been removed.
    const { sortBy } = decodeSearch(location.search, this.props);
    const newSort = fields.includes(sortBy.field)
      ? sortBy
      : { ...sortBy, field: fields.filter(field => field !== pseudoLabelField)[0] };
    this.setSearch({ fields, sortBy: newSort });
  };

  // ==============================
  // Sorting
  // ==============================

  handleSortChange = sortBy => {
    this.setSearch({ sortBy });
  };

  // ==============================
  // Pagination
  // ==============================

  handlePageChange = currentPage => {
    this.setSearch({ currentPage });
  };
  handlePageReset = () => {
    this.setSearch({ currentPage: 1 });
  };
  handlePageSizeChange = pageSize => {
    this.setSearch({ pageSize });
  };

  setSearch = (changes, addHistoryRecord = true) => {
    const { location, history } = this.props;
    const currentState = decodeSearch(location.search, this.props);
    let overrides = {};

    // NOTE: some changes should reset the currentPage number to 1.
    // eg: typing in the search box or changing filters
    const resetsCurrentPage = ['search', 'pageSize', 'filters'];
    if (Object.keys(changes).some(k => resetsCurrentPage.includes(k))) {
      overrides.currentPage = 1;
    }

    // encode the new search string
    const search = encodeSearch(
      {
        ...currentState,
        ...changes,
        ...overrides,
      },
      this.props
    );

    const newLocation = {
      ...location,
      search,
    };

    this.props.list.setPersistedSearch(search);

    // Do we want to add an item to history or not
    if (addHistoryRecord) {
      history.push(newLocation);
    } else {
      history.replace(newLocation);
    }
  };

  handleReset = () => {
    this.setSearch(decodeSearch('', this.props));
  };

  itemsCount: number;
  items: Object;
  render() {
    const { children, list, location } = this.props;
    const { currentPage, pageSize, search, fields, sortBy, filters } = decodeSearch(
      location.search,
      this.props
    );
    const orderBy = `${sortBy.field.path}_${sortBy.direction}`;
    const first = pageSize;
    const skip = (currentPage - 1) * pageSize;
    const query = getQuery({
      fields,
      filters,
      list,
      search,
      orderBy,
      skip,
      first,
    });

    return (
      <Fragment>
        <DocTitle adminMeta={this.props.adminMeta}>{list.plural}</DocTitle>
        <Nav />
        <Query query={query} fetchPolicy="cache-and-network" errorPolicy="all">
          {({ data, error, loading, refetch }) => {
            // Only show error page if there is no data
            // (ie; there could be partial data + partial errors)
            if (
              error &&
              (!data ||
                !data[list.gqlNames.listQueryName] ||
                !Object.keys(data[list.gqlNames.listQueryName]).length)
            ) {
              let message = error.message;

              // If there was an error returned by GraphQL, use that message
              // instead
              if (
                error.networkError &&
                error.networkError.result &&
                error.networkError.result.errors &&
                error.networkError.result.errors[0]
              ) {
                message = error.networkError.result.errors[0].message || message;
              }

              // Special case for when trying to access a non-existent list or a
              // list that is set to `read: false`.
              if (message.startsWith('Cannot query field')) {
                message = `Unable to access list ${list.plural}`;
              }

              return (
                <PageError>
                  <p>{message}</p>
                </PageError>
              );
            }

            const itemsErrors =
              deconstructErrorsToDataShape(error)[list.gqlNames.listQueryName] || [];

            // Leave the old values intact while new data is loaded
            if (!loading) {
              // TODO: doing this will break/cause unexpected behaviour with suspense so it should use state or something
              this.items = data && data[list.gqlNames.listQueryName];
              this.itemsCount =
                (data &&
                  data[list.gqlNames.listQueryMetaName] &&
                  data[list.gqlNames.listQueryMetaName].count) ||
                0;
            }

            return children({
              query: { data, error, loading, refetch },
              itemsErrors,
              data: {
                currentPage,
                fields,
                filters,
                items: this.items,
                itemsCount: this.itemsCount,
                pageSize,
                search,
                skip,
                sortBy,
              },
              handlers: {
                handleFilterRemove: this.handleFilterRemove,
                handleFilterRemoveAll: this.handleFilterRemoveAll,
                handleFilterAdd: this.handleFilterAdd,
                handleFilterUpdate: this.handleFilterUpdate,
                handleFieldChange: this.handleFieldChange,
                handlePageChange: this.handlePageChange,
                handlePageReset: this.handlePageReset,
                handlePageSizeChange: this.handlePageSizeChange,
                handleSearchChange: this.handleSearchChange,
                handleSearchClear: this.handleSearchClear,
                handleSearchSubmit: this.handleSearchSubmit,
                handleSortChange: this.handleSortChange,
                handleReset: this.handleReset,
              },
            });
          }}
        </Query>
      </Fragment>
    );
  }
}

export default withRouter(ListPageDataProvider);
