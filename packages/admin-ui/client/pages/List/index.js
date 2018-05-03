import React, { Component, Fragment } from 'react';
import styled from 'react-emotion';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { withRouter } from 'react-router-dom';

import { FoldIcon, UnfoldIcon, PlusIcon, SearchIcon } from '@keystonejs/icons';
import { Input } from '@keystonejs/ui/src/primitives/forms';
import {
  Container,
  FlexGroup,
  CONTAINER_WIDTH,
} from '@keystonejs/ui/src/primitives/layout';
import { Title } from '@keystonejs/ui/src/primitives/typography';
import { Button } from '@keystonejs/ui/src/primitives/buttons';
import { Pagination } from '@keystonejs/ui/src/primitives/navigation';
import { colors, gridSize } from '@keystonejs/ui/src/theme';

import ListTable from '../../components/ListTable';
import CreateItemModal from '../../components/CreateItemModal';
import Nav from '../../components/Nav';
import { Popout, DisclosureArrow } from '../../components/Popout';

import ColumnSelect from './ColumnSelect';
import SortSelect, { SortButton } from './SortSelect';

const getQueryArgs = args => {
  const queryArgs = Object.keys(args).map(
    argName => `${argName}: "${args[argName]}"`
  );
  return queryArgs.length ? `(${queryArgs.join(' ')})` : '';
};

const getQuery = ({ fields, list, search, sort }) => {
  const queryArgs = getQueryArgs({ search, sort });
  const queryFields = ['id', ...fields.map(({ path }) => path)];

  return gql`{
    ${list.listQueryName}${queryArgs} {
      ${queryFields.join('\n')}
    }
  }`;
};

// ==============================
// Columns
// ==============================

const FilterPopout = () => {
  return (
    <Popout buttonLabel="Filter" headerTitle="Filter">
      <code>// TODO</code>
    </Popout>
  );
};
const FilterSeparator = styled.div({
  backgroundColor: 'rgba(0,0,0,0.1)',
  height: '100%',
  width: 1,
});

const Note = styled.div({
  color: colors.N60,
  fontSize: '0.85em',
});
const Kbd = styled.kbd({
  backgroundColor: colors.N05,
  border: `1px solid ${colors.N20}`,
  borderRadius: 3,
  boxShadow:
    '0 1px 1px rgba(0, 0, 0, 0.12), 0 2px 0 0 rgba(255, 255, 255, 0.7) inset',
  display: 'inline-block',
  fontFamily: 'Monaco, monospace',
  fontSize: '0.85em',
  fontWeight: 'bold',
  lineHeight: 'inherit',
  padding: '1px 5px',
  position: 'relative',
  top: '-1px',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
});

const Search = ({ children }) => (
  <div css={{ position: 'relative' }}>
    {children}
    <SearchIcon
      css={{
        color: colors.N30,
        position: 'absolute',
        right: gridSize * 1.5,
        top: '50%',
        transform: 'translateY(-50%)',
      }}
    />
  </div>
);

function getInvertedSort(direction) {
  const inverted = { ASC: 'DESC', DESC: 'ASC' };
  return inverted[direction] || direction;
}

// TODO define state
// type State = {
//   displayedFields,
//   sortDirection,
//   sortBy,
//   search: '',
//   showCreateModal: false,
// }

class ListPage extends Component {
  constructor(props) {
    super(props);
    const displayedFields = this.props.list.fields.slice(0, 2);
    const sortDirection = ListPage.orderOptions[0].value;
    const sortBy = displayedFields[0];

    this.state = {
      displayedFields,
      listIsFullWidth: false,
      sortDirection,
      sortBy,
      search: '',
      showCreateModal: false,
    };
  }

  static orderOptions = [
    { label: 'Ascending', value: 'ASC' },
    { label: 'Descending', value: 'DESC' },
  ];

  // We record the number of items returned by the latest query so that the
  // previous count can be displayed during a loading state.
  itemsCount: 0;

  toggleFullWidth = () => {
    this.setState(state => ({ listIsFullWidth: !state.listIsFullWidth }));
  };

  handleSearch = e => {
    const { value: search } = e.target;
    this.setState({ search });
  };

  handleSelectedFieldsChange = selectedFields => {
    if (!selectedFields.length) {
      return;
    }

    // Ensure that the displayed fields maintain their original sortDirection when
    // they're added/removed
    const displayedFields = this.props.list.fields.filter(field =>
      selectedFields.includes(field)
    );

    // Reset sortBy if we were ordering by a field which has been removed.
    const sortBy = displayedFields.includes(this.state.sortBy)
      ? this.state.sortBy
      : displayedFields[0];

    this.setState({ displayedFields, sortBy });
  };

  handleSortChange = ({ sortBy, inverted }) => {
    const originalDirection = this.state.sortDirection;
    const sortDirection = inverted
      ? getInvertedSort(originalDirection)
      : originalDirection;
    this.setState({ sortBy, sortDirection });
  };

  closeCreateModal = () => this.setState({ showCreateModal: false });
  openCreateModal = () => this.setState({ showCreateModal: true });
  onCreate = ({ data }) => {
    let { list, adminPath, history } = this.props;
    let id = data[list.createMutationName].id;
    history.push(`${adminPath}/${list.path}/${id}`);
  };

  renderCreateModal() {
    const { showCreateModal } = this.state;
    if (!showCreateModal) return;
    const { list } = this.props;

    return (
      <CreateItemModal
        list={list}
        onClose={this.closeCreateModal}
        onCreate={this.onCreate}
      />
    );
  }
  renderExpandButton() {
    if (window && window.innerWidth < CONTAINER_WIDTH) return null;

    const { listIsFullWidth } = this.state;
    const Icon = listIsFullWidth ? FoldIcon : UnfoldIcon;
    const title = listIsFullWidth ? 'Collapse' : 'Expand';

    return [
      <FilterSeparator />,
      <Button onClick={this.toggleFullWidth} title={title}>
        <Icon css={{ transform: 'rotate(90deg)' }} />
      </Button>,
    ];
  }

  render() {
    const { list, adminPath } = this.props;
    const {
      displayedFields,
      listIsFullWidth,
      sortDirection,
      sortBy,
      search,
    } = this.state;

    const sort = `${sortDirection === 'DESC' ? '-' : ''}${sortBy.path}`;

    const query = getQuery({
      fields: displayedFields,
      list,
      search,
      sort,
    });

    return (
      <Fragment>
        <Nav />
        <Query query={query} fetchPolicy="cache-and-network">
          {({ data, error, refetch }) => {
            if (error) {
              return (
                <Fragment>
                  <Title>Error</Title>
                  <p>{error.message}</p>
                </Fragment>
              );
            }

            const items = data && data[list.listQueryName];
            this.count =
              items && typeof items.length === 'number'
                ? items.length
                : this.count;

            return (
              <Fragment>
                <Container>
                  <Title>
                    {this.count} {this.count === 1 ? list.label : list.plural}{' '}
                    sorted by
                    <Popout
                      headerTitle="Sort"
                      footerContent={
                        <Note>
                          Hold <Kbd>alt</Kbd> to toggle ascending/descending
                        </Note>
                      }
                      target={
                        <SortButton>
                          {' '}
                          {sortBy.label.toLowerCase()}
                          <DisclosureArrow size="0.25em" />
                        </SortButton>
                      }
                    >
                      <SortSelect
                        fields={list.fields}
                        onChange={this.handleSortChange}
                        value={sortBy}
                      />
                    </Popout>
                  </Title>

                  <FlexGroup growIndexes={[0]}>
                    <Search>
                      <Input
                        onChange={this.handleSearch}
                        placeholder="Search"
                        value={search}
                      />
                    </Search>
                    <FilterPopout />
                    <Popout buttonLabel="Columns" headerTitle="Columns">
                      <ColumnSelect
                        isMulti
                        fields={list.fields}
                        onChange={this.handleSelectedFieldsChange}
                        value={displayedFields}
                        placeholder="Find a column..."
                        removeIsAllowed={displayedFields.length > 1}
                      />
                    </Popout>
                    {this.renderExpandButton()}
                    <FilterSeparator />
                    <Button appearance="create" onClick={this.openCreateModal}>
                      <span css={{ display: 'flex', alignItems: 'center' }}>
                        <PlusIcon css={{ marginRight: '0.5em' }} />
                        Create
                      </span>
                    </Button>
                  </FlexGroup>

                  <div
                    css={{
                      marginBottom: '1em',
                      marginTop: '1em',
                      visibility: this.count ? 'visible' : 'hidden',
                    }}
                  >
                    <Pagination
                      total={this.count}
                      displayCount
                      single={list.label}
                      plural={list.plural}
                    />
                  </div>
                </Container>

                {/*
                    // Old sort switch asc/desc
                    <Select
                      options={ListPage.orderOptions}
                      onChange={this.handleOrderChange}
                      styles={selectStyles}
                      value={sortDirection}
                    />
                  */}

                {this.renderCreateModal()}

                <Container isDisabled={listIsFullWidth}>
                  {items ? (
                    <ListTable
                      items={items}
                      list={list}
                      fields={displayedFields}
                      adminPath={adminPath}
                      onChange={refetch}
                      noResultsMessage={
                        <span>
                          No {list.plural.toLowerCase()} found matching &ldquo;{
                            search
                          }&rdquo;
                        </span>
                      }
                    />
                  ) : (
                    <Title>Loading...</Title>
                  )}
                </Container>
              </Fragment>
            );
          }}
        </Query>
      </Fragment>
    );
  }
}

export default withRouter(ListPage);
