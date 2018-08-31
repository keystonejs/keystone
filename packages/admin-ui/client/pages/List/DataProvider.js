import React, { Component, Fragment } from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { withRouter } from 'react-router-dom';

import Nav from '../../components/Nav';
import DocTitle from '../../components/DocTitle';
import PageError from '../../components/PageError';
import { deconstructErrorsToDataShape } from '../../util';

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

  return gql`{
    ${list.listQueryName}${queryArgs} {
      id
      _label_
      ${fields.map(field => field.getQueryFragment()).join('\n')}
    }
    _${list.listQueryName}Meta${metaQueryArgs} {
      count
    }
  }`;
};

export type SortByType = {
  field: { label: string, path: string },
  direction: 'ASC' | 'DESC',
};
type Props = {
  list: Object,
};
type State = {
  currentPage: number,
  fields: Array<Object>,
  filters: Array<Object>,
  pageSize: number,
  search: string,
  skip: number,
  sortBy: SortByType,
};

class ListPageDataProvider extends Component<Props, State> {
  constructor(props) {
    super(props);

    // Prepare active fields and sort order
    const fields = props.list.defaultColumns
      ? props.list.fields.filter(({ path }) => props.list.defaultColumns.includes(path))
      : props.list.fields.slice(0, 2);
    const sortBy = { field: fields[0], direction: 'ASC' };

    // We record the number of items returned by the latest query so that the
    // previous count can be displayed during a loading state.
    this.itemsCount = 0;

    // Declare initial state
    this.state = {
      currentPage: 1,
      fields,
      pageSize: 50,
      search: '',
      filters: [],
      skip: 0,
      sortBy,
    };
  }

  // ==============================
  // Search
  // ==============================

  handleSearchChange = ({ target: { value: search } }) => {
    this.setState({ search });
  };
  handleSearchClear = () => {
    this.setState({ search: '' });
    this.input.focus();
  };
  handleSearchSubmit = event => {
    let { list, adminPath, history } = this.props;

    event.preventDefault();

    if (this.items.length === 1) {
      history.push(`${adminPath}/${list.path}/${this.items[0].id}`);
    }
  };

  // ==============================
  // Filters
  // ==============================

  handleFilterRemove = value => () => {
    let filters = this.state.filters.slice(0);
    filters = filters.filter(f => f !== value);

    this.setState({ filters });
  };
  handleFilterRemoveAll = () => {
    this.setState({ filters: [] });
  };
  handleFilterAdd = value => {
    let filters = this.state.filters.slice(0);
    filters.push(value);

    this.setState({ filters });
  };
  handleFilterUpdate = updatedFilter => {
    let filters = this.state.filters.slice(0);

    const updateIndex = filters.findIndex(i => {
      return i.field.path === updatedFilter.field.path && i.type === updatedFilter.type;
    });

    filters.splice(updateIndex, 1, updatedFilter);

    this.setState({ filters });
  };

  // ==============================
  // Columns
  // ==============================

  handleFieldChange = selectedFields => {
    if (!selectedFields.length) {
      return;
    }

    // Ensure that the displayed fields maintain their original sortDirection
    // when they're added/removed
    const fields = this.props.list.fields.filter(field => selectedFields.includes(field));

    // Reset `sortBy` if we were ordering by a field which has been removed.
    const { sortBy } = this.state;
    const newSort = fields.includes(sortBy.field) ? sortBy : { ...sortBy, field: fields[0] };

    this.setState({ fields, sortBy: newSort });
  };

  // ==============================
  // Sorting
  // ==============================

  handleSortChange = sortBy => {
    this.setState({ sortBy });
  };

  // ==============================
  // Pagination
  // ==============================

  handlePageChange = currentPage => {
    const { pageSize } = this.state;
    const skip = (currentPage - 1) * pageSize;
    this.setState({ currentPage, skip });
  };

  render() {
    const { children, list } = this.props;
    const { currentPage, fields, filters, pageSize, search, skip, sortBy } = this.state;

    const orderBy = `${sortBy.field.path}_${sortBy.direction}`;
    const first = pageSize;
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
        <DocTitle>{list.plural}</DocTitle>
        <Nav />
        <Query query={query} fetchPolicy="cache-and-network" errorPolicy="all">
          {({ data, error, loading, refetch }) => {
            // Only show error page if there is no data
            // (ie; there could be partial data + partial errors)
            if (
              error &&
              (!data || !data[list.listQueryName] || !Object.keys(data[list.listQueryName]).length)
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

            const itemsErrors = deconstructErrorsToDataShape(error)[list.listQueryName] || [];

            // Leave the old values intact while new data is loaded
            if (!loading) {
              this.items = data && data[list.listQueryName];
              this.itemsCount =
                (data &&
                  data[`_${list.listQueryName}Meta`] &&
                  data[`_${list.listQueryName}Meta`].count) ||
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
                handleSearchChange: this.handleSearchChange,
                handleSearchClear: this.handleSearchClear,
                handleSearchSubmit: this.handleSearchSubmit,
                handleSortChange: this.handleSortChange,
              },
            });
          }}
        </Query>
      </Fragment>
    );
  }
}

export default withRouter(ListPageDataProvider);
