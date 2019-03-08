import React, { Component, Fragment } from 'react';
import debounce from 'lodash.debounce';
import { Query } from 'react-apollo';

import { Router, withRouter } from '../../providers/Router';
import DocTitle from '../../components/DocTitle';
import PageError from '../../components/PageError';
import { deconstructErrorsToDataShape } from '../../util';
import { decodeSearch, encodeSearch } from './url-state';

type Props = {
  list: Object,
  router: Object,
};

type State = {};

class ListPageDataProvider extends Component<Props, State> {
  constructor(props) {
    super(props);
    // We record the number of items returned by the latest query so that the
    // previous count can be displayed during a loading state.
    this.itemsCount = 0;
  }

  componentDidMount() {
    const { list, router } = this.props;
    const maybePersistedSearch = list.getPersistedSearch();
    if (Object.keys(router.query).length) {
      if (router.query !== maybePersistedSearch) {
        list.setPersistedSearch(router.query);
      }
    } else if (maybePersistedSearch) {
      // NOTE: .asPath already contains the prefix, so we don't need to add it
      // again here
      Router.replace({
        pathname: router.asPath,
        query: maybePersistedSearch,
      });
    }
  }

  // ==============================
  // Search
  // ==============================

  handleSearchChange = debounce(newSearch => {
    const { router } = this.props;
    const { search } = decodeSearch(router.query, this.props);
    const addHistoryRecord = !search;
    this.setSearch({ search: newSearch }, addHistoryRecord);
  }, 300);
  handleSearchClear = () => {
    const { router } = this.props;
    const { search } = decodeSearch(router.query, this.props);
    const addHistoryRecord = !!search;
    this.setSearch({ search: '' }, addHistoryRecord);
  };
  handleSearchSubmit = () => {
    const { router } = this.props;
    // FIXME: This seems likely to do the wrong thing if data is not yet loaded.
    if (this.items.length === 1) {
      // NOTE: .asPath already contains the prefix, so we don't need to add it
      // again here
      Router.push(`${router.asPath.split('?')[0]}/${this.items[0].id}`);
    }
  };

  // ==============================
  // Filters
  // ==============================

  handleFilterRemove = value => () => {
    const { router } = this.props;
    const { filters } = decodeSearch(router.query, this.props);
    const newFilters = filters.filter(f => {
      return !(f.field.path === value.field.path && f.type === value.type);
    });
    this.setSearch({ filters: newFilters });
  };
  handleFilterRemoveAll = () => {
    this.setSearch({ filters: [] });
  };
  handleFilterAdd = value => {
    const { router } = this.props;
    const { filters } = decodeSearch(router.query, this.props);
    filters.push(value);
    this.setSearch({ filters });
  };
  handleFilterUpdate = updatedFilter => {
    const { router } = this.props;
    const { filters } = decodeSearch(router.query, this.props);

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
    const { list, router } = this.props;

    // Ensure that the displayed fields maintain their original sortDirection
    // when they're added/removed
    const fields = list
      .getFieldControllers()
      .filter(field => selectedFields.some(selectedField => selectedField.path === field.path));

    // Reset `sortBy` if we were ordering by a field which has been removed.
    const { sortBy } = decodeSearch(router.query, this.props);
    const newSort = fields.includes(sortBy.field)
      ? sortBy
      : { ...sortBy, field: fields.find(field => field.isSortable()) };
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
    const { router } = this.props;
    const currentState = decodeSearch(router.query, this.props);
    let overrides = {};

    // NOTE: some changes should reset the currentPage number to 1.
    // eg: typing in the search box or changing filters
    const resetsCurrentPage = ['search', 'pageSize', 'filters'];
    if (Object.keys(changes).some(k => resetsCurrentPage.includes(k))) {
      overrides.currentPage = 1;
    }

    // encode the new search string
    const query = encodeSearch(
      {
        ...currentState,
        ...changes,
        ...overrides,
      },
      this.props
    );

    // TODO: FIXME: This should be { route: '', params: { ...originalQueryParams, ...query } }
    const newRoute = {
      pathname: router.asPath,
      query,
    };

    this.props.list.setPersistedSearch(query);

    // Do we want to add an item to history or not
    if (addHistoryRecord) {
      Router.push(newRoute);
    } else {
      Router.replace(newRoute);
    }
  };

  handleReset = () => {
    this.setSearch(decodeSearch({}, this.props));
  };

  render() {
    const { children, list, router } = this.props;
    const { currentPage, pageSize, search, fields, sortBy, filters } = decodeSearch(
      router.query,
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
