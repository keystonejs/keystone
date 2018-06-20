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

function getInvertedSort(direction) {
  const inverted = { ASC: 'DESC', DESC: 'ASC' };
  return inverted[direction] || direction;
}

const DEFAULT_PAGE_SIZE = 50;

type Props = {
  list: Object,
};
type State = {
  currentPage: number,
  fields: Array<Object>,
  search: string,
  skip: number,
  sortBy: string,
  sortDirection: string,
};

class ListPage extends Component<Props, State> {
  constructor(props) {
    super(props);
    const fields = this.props.list.fields.slice(0, 2);
    const sortDirection = ListPage.orderOptions[0].value;
    const sortBy = fields[0];

    this.state = {
      fields,
      sortDirection,
      sortBy,
      search: '',
      skip: 0,
      currentPage: 1,
    };
  }

  static orderOptions = [
    { label: 'Ascending', value: 'ASC' },
    { label: 'Descending', value: 'DESC' },
  ];

  // We record the number of items returned by the latest query so that the
  // previous count can be displayed during a loading state.
  itemsCount: 0;

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

  handleFieldChange = selectedFields => {
    if (!selectedFields.length) {
      return;
    }

    // Ensure that the displayed fields maintain their original sortDirection when
    // they're added/removed
    const fields = this.props.list.fields.filter(field =>
      selectedFields.includes(field)
    );

    // Reset sortBy if we were ordering by a field which has been removed.
    const sortBy = fields.includes(this.state.sortBy)
      ? this.state.sortBy
      : fields[0];

    this.setState({ fields, sortBy });
  };

  handleSortChange = ({ sortBy, inverted }) => {
    const originalDirection = this.state.sortDirection;
    const sortDirection = inverted
      ? getInvertedSort(originalDirection)
      : originalDirection;
    this.setState({ sortBy, sortDirection });
  };
  handlePageChange = currentPage => {
    const skip = (currentPage - 1) * DEFAULT_PAGE_SIZE;
    this.setState({ currentPage, skip });
  };

  render() {
    const { children, list } = this.props;
    const {
      currentPage,
      fields,
      sortDirection,
      sortBy,
      search,
      skip,
    } = this.state;

    const sort = `${sortDirection === 'DESC' ? '-' : ''}${sortBy.path}`;
    const first = DEFAULT_PAGE_SIZE; // TODO: move this to state; let the user select pagesize
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
                sortDirection,
                sortBy,
                search,
                skip,
                items: this.items,
                itemsCount: this.itemsCount,
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

export default withRouter(ListPage);
