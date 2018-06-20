import React, { Component, Fragment } from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { withRouter } from 'react-router-dom';

import Nav from '../../components/Nav';
import DocTitle from '../../components/DocTitle';
import PageError from '../../components/PageError';

const getQueryArgs = args => {
  const queryArgs = Object.keys(args).map(
    // Using stringify to get the correct quotes depending on type
    argName => `${argName}: ${JSON.stringify(args[argName])}`
  );
  return queryArgs.length ? `(${queryArgs.join(' ')})` : '';
};

const getQuery = ({ fields, list, search, sort, skip, first }) => {
  const queryArgs = getQueryArgs({ search, sort, skip, first });
  const metaQueryArgs = getQueryArgs({ search });

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
  pageSize: number,
  search: string,
  skip: number,
  sortBy: SortByType,
};

class ListPageDataProvider extends Component<Props, State> {
  constructor(props) {
    super(props);

    // Prepare active fields and sort order
    const fields = props.list.fields.slice(0, 2);
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
  // Columns
  // ==============================

  handleFieldChange = selectedFields => {
    if (!selectedFields.length) {
      return;
    }

    // Ensure that the displayed fields maintain their original sortDirection
    // when they're added/removed
    const fields = this.props.list.fields.filter(field =>
      selectedFields.includes(field)
    );

    // Reset `sortBy` if we were ordering by a field which has been removed.
    const { sortBy } = this.state;
    const newSort = fields.includes(sortBy.field)
      ? sortBy
      : { ...sortBy, field: fields[0] };

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
    const { currentPage, fields, pageSize, sortBy, search, skip } = this.state;

    const sort = `${sortBy.direction === 'DESC' ? '-' : ''}${
      sortBy.field.path
    }`;
    const first = pageSize;
    const query = getQuery({ fields, list, search, sort, skip, first });

    return (
      <Fragment>
        <DocTitle>{list.plural}</DocTitle>
        <Nav />
        <Query query={query} fetchPolicy="cache-and-network">
          {({ data, error, loading, refetch }) => {
            if (error) {
              return (
                <PageError>
                  <p>{error.message}</p>
                </PageError>
              );
            }

            // Leave the old values intact while new data is loaded
            if (!loading) {
              this.items = data && data[list.listQueryName];
              this.itemsCount =
                data &&
                data[`_${list.listQueryName}Meta`] &&
                data[`_${list.listQueryName}Meta`].count;
            }

            return children({
              query: { data, error, loading, refetch },
              data: {
                currentPage,
                fields,
                items: this.items,
                itemsCount: this.itemsCount,
                pageSize,
                search,
                skip,
                sortBy,
              },
              handlers: {
                handleSearchChange: this.handleSearchChange,
                handleSearchClear: this.handleSearchClear,
                handleSearchSubmit: this.handleSearchSubmit,
                handleFieldChange: this.handleFieldChange,
                handleSortChange: this.handleSortChange,
                handlePageChange: this.handlePageChange,
              },
            });
          }}
        </Query>
      </Fragment>
    );
  }
}

export default withRouter(ListPageDataProvider);
