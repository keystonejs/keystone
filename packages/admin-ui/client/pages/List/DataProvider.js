import React, { Component, Fragment } from 'react';
import debounce from 'lodash.debounce';
import { Query } from 'react-apollo';
import { withRouter } from 'react-router-dom';

import DocTitle from '../../components/DocTitle';
import PageError from '../../components/PageError';
import { deconstructErrorsToDataShape } from '../../util';
import { pseudoLabelField } from './FieldSelect';
import { decodeSearch, encodeSearch } from './url-state';

type Props = {
  list: Object,
  match: Object,
  location: Object,
  history: Object,
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

  render() {
    const { children, list, location } = this.props;
    const { currentPage, pageSize, search, fields, sortBy, filters } = decodeSearch(
      location.search,
      this.props
    );

    const orderBy = `${sortBy.field.path}_${sortBy.direction}`;
    const first = pageSize;
    const skip = (currentPage - 1) * pageSize;
    const query = list.getQuery({
      fields,
      filters,
      search,
      orderBy,
      skip,
      first,
    });

    return (
      <Fragment>
        <DocTitle>{list.plural}</DocTitle>
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
