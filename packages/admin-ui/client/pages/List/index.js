/* global ENABLE_DEV_FEATURES */
import React, { Component, Fragment } from 'react';
import styled from 'react-emotion';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { withRouter } from 'react-router-dom';

import {
  FoldIcon,
  GearIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  TrashcanIcon,
  UnfoldIcon,
  XIcon,
} from '@keystonejs/icons';
import { Input } from '@keystonejs/ui/src/primitives/forms';
import {
  Container,
  FlexGroup,
  CONTAINER_WIDTH,
} from '@keystonejs/ui/src/primitives/layout';
import { A11yText, Kbd, H1 } from '@keystonejs/ui/src/primitives/typography';
import { Button, IconButton } from '@keystonejs/ui/src/primitives/buttons';
import { Pagination } from '@keystonejs/ui/src/primitives/navigation';
import { LoadingSpinner } from '@keystonejs/ui/src/primitives/loading';
import { Pill } from '@keystonejs/ui/src/primitives/pill';
import { colors, gridSize } from '@keystonejs/ui/src/theme';

import AnimateHeight from '../../components/AnimateHeight';
import ListTable from '../../components/ListTable';
import CreateItemModal from '../../components/CreateItemModal';
import UpdateManyItemsModal from '../../components/UpdateManyItemsModal';
import DeleteManyItemsModal from '../../components/DeleteManyItemsModal';
import Nav from '../../components/Nav';
import DocTitle from '../../components/DocTitle';
import PageLoading from '../../components/PageLoading';
import PageError from '../../components/PageError';
import { Popout, DisclosureArrow } from '../../components/Popout';

import ColumnSelect from './ColumnSelect';
import FilterSelect from './FilterSelect';
import SortSelect, { SortButton } from './SortSelect';

// ==============================
// Queries
// ==============================

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

// ==============================
// Styled Components
// ==============================

const FilterSeparator = styled.div({
  backgroundColor: 'rgba(0,0,0,0.1)',
  height: '100%',
  width: 1,
});

const Note = styled.div({
  color: colors.N60,
  fontSize: '0.85em',
});

const Search = ({ children, hasValue, isFetching, onClear, onSubmit }) => {
  const Icon = hasValue ? XIcon : SearchIcon;
  const isLoading = hasValue && isFetching;

  // NOTE: `autoComplete="off"` doesn't behave as expected on `<input />` in
  // webkit, so we apply the attribute to a form tag here.
  return (
    <form css={{ position: 'relative' }} autoComplete="off" onSubmit={onSubmit}>
      {children}
      <div
        css={{
          color: colors.N30,
          cursor: 'pointer',
          pointerEvents: hasValue ? 'all' : 'none',
          position: 'absolute',
          right: gridSize * 1.5,
          top: '50%',
          transform: 'translateY(-50%)',

          ':hover': {
            color: hasValue ? colors.text : colors.N30,
          },
        }}
      >
        {isLoading ? (
          <LoadingSpinner size={16} />
        ) : (
          <Icon onClick={hasValue ? onClear : null} />
        )}
      </div>
    </form>
  );
};

function getInvertedSort(direction) {
  const inverted = { ASC: 'DESC', DESC: 'ASC' };
  return inverted[direction] || direction;
}

const DEFAULT_PAGE_SIZE = 50;

class ListPage extends Component {
  constructor(props) {
    super(props);
    const displayedFields = this.props.list.fields.slice(0, 2);
    const sortDirection = ListPage.orderOptions[0].value;
    const sortBy = displayedFields[0];

    this.state = {
      displayedFields,
      selectedFilters: [],
      isFullWidth: false,
      isManaging: false,
      selectedItems: [],
      sortDirection,
      sortBy,
      search: '',
      showCreateModal: false,
      showUpdateModal: false,
      showDeleteSelectedItemsModal: false,
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

  toggleFullWidth = () => {
    this.setState(state => ({ isFullWidth: !state.isFullWidth }));
  };

  handleSearch = e => {
    const { value: search } = e.target;
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

  // ==============================
  // Management
  // ==============================

  closeUpdateModal = () => this.setState({ showUpdateModal: false });
  openUpdateModal = () => this.setState({ showUpdateModal: true });

  handleItemSelect = (itemIds: Array<string>) => {
    let selectedItems = this.state.selectedItems.slice(0);

    itemIds.forEach(id => {
      if (selectedItems.includes(id)) {
        selectedItems = selectedItems.filter(existingId => existingId !== id);
      } else {
        selectedItems.push(id);
      }
    });

    this.setState({ selectedItems });
  };
  handleSelectAll = (selectedItems: Array<string>) => {
    this.setState({ selectedItems });
  };
  startManaging = () => {
    this.setState({ isManaging: true }, () => {
      this.manageCancel.focus();
    });
  };
  stopManaging = () => {
    this.setState({ isManaging: false, selectedItems: [] }, () => {
      this.manageButton.focus();
    });
  };
  toggleManaging = () => {
    const fn = this.state.isManaging ? this.stopManaging : this.startManaging;
    fn();
  };
  getManageCancel = ref => {
    this.manageCancel = ref;
  };
  getManageButton = ref => {
    this.manageButton = ref;
  };
  openDeleteSelectedItemsModal = () => {
    const { selectedItems } = this.state;
    if (!selectedItems.length) return;
    this.setState({
      showDeleteSelectedItemsModal: true,
    });
  };
  closeDeleteSelectedItemsModal = () => {
    this.setState({
      showDeleteSelectedItemsModal: false,
    });
  };
  onDeleteSelectedItems = () => {
    this.closeDeleteSelectedItemsModal();
    if (this.refetch) this.refetch();
    this.setState({
      selectedItems: [],
    });
  };
  onCreate = ({ data }) => {
    let { list, adminPath, history } = this.props;
    let id = data[list.createMutationName].id;
    history.push(`${adminPath}/${list.path}/${id}`);
  };
  onFilterChange = value => {
    let selectedFilters = this.state.selectedFilters.slice(0);

    if (selectedFilters.includes(value)) {
      selectedFilters = selectedFilters.filter(f => f !== value);
    } else {
      selectedFilters.push(value);
    }

    this.setState({ selectedFilters });
  };
  onFilterClear = () => {
    this.setState({ selectedFilters: [] });
  };

  // ==============================
  // Renderers
  // ==============================

  renderCreateModal() {
    const { showCreateModal } = this.state;
    const { list } = this.props;

    return (
      <CreateItemModal
        isOpen={showCreateModal}
        list={list}
        onClose={this.closeCreateModal}
        onCreate={this.onCreate}
      />
    );
  }
  renderUpdateModal() {
    const { list } = this.props;
    const { selectedItems, showUpdateModal } = this.state;

    return (
      <UpdateManyItemsModal
        isOpen={showUpdateModal}
        list={list}
        items={selectedItems}
        onClose={this.closeUpdateModal}
        onUpdate={this.onUpdate}
      />
    );
  }
  renderDeleteSelectedItemsModal() {
    const { selectedItems, showDeleteSelectedItemsModal } = this.state;
    const { list } = this.props;

    return (
      <DeleteManyItemsModal
        isOpen={showDeleteSelectedItemsModal}
        list={list}
        itemIds={selectedItems}
        onClose={this.closeDeleteSelectedItemsModal}
        onDelete={this.onDeleteSelectedItems}
      />
    );
  }
  renderExpandButton() {
    if (window && window.innerWidth < CONTAINER_WIDTH) return null;

    const { isFullWidth } = this.state;
    const Icon = isFullWidth ? FoldIcon : UnfoldIcon;
    const text = isFullWidth ? 'Collapse' : 'Expand';

    // Note: we return an array here instead of a <Fragment> because the
    // <FlexGroup> component it is rendered into passes props to its children
    return [
      <FilterSeparator key="expand-separator" />,
      <Button
        onClick={this.toggleFullWidth}
        title={text}
        isActive={isFullWidth}
        key="expand-button"
      >
        <Icon css={{ transform: 'rotate(90deg)' }} />
        <A11yText>{text}</A11yText>
      </Button>,
    ];
  }
  renderFilters() {
    const { list } = this.props;
    const { selectedFilters } = this.state;
    const pillStyle = { marginBottom: gridSize / 2, marginTop: gridSize / 2 };

    console.log('selectedFilters', selectedFilters);

    return ENABLE_DEV_FEATURES ? (
      <FlexGroup style={{ paddingTop: gridSize }} wrap>
        {selectedFilters.length
          ? selectedFilters.map(f => (
              <Pill
                key={f.label}
                appearance="primary"
                onRemove={() => this.onFilterChange(f)}
                style={pillStyle}
              >
                {f.label}
              </Pill>
            ))
          : null}
        {selectedFilters.length > 1 ? (
          <Pill key="clear" onClick={this.onFilterClear} style={pillStyle}>
            Clear All
          </Pill>
        ) : null}
      </FlexGroup>
    ) : null;
  }
  renderPaginationOrManage() {
    const { list } = this.props;
    const { isManaging, selectedItems } = this.state;
    const selectedCount = selectedItems.length;
    const hasSelected = Boolean(selectedCount);

    const managementUI = (
      <FlexGroup align="center">
        {ENABLE_DEV_FEATURES ? (
          <IconButton
            appearance="primary"
            icon={SettingsIcon}
            isDisabled={!hasSelected}
            onClick={this.openUpdateModal}
            variant="ghost"
          >
            Update
          </IconButton>
        ) : null}
        <IconButton
          appearance="danger"
          icon={TrashcanIcon}
          isDisabled={!hasSelected}
          onClick={this.openDeleteSelectedItemsModal}
          variant="ghost"
        >
          Delete
        </IconButton>
        <Button
          innerRef={this.getManageCancel}
          onClick={this.toggleManaging}
          variant="subtle"
        >
          Done
        </Button>
      </FlexGroup>
    );
    const paginationUI = (
      <FlexGroup align="center">
        <IconButton
          icon={GearIcon}
          innerRef={this.getManageButton}
          onClick={this.toggleManaging}
          variant="ghost"
          style={{ marginRight: '0.5em' }}
        >
          Manage
        </IconButton>
        <Pagination
          total={this.itemsCount}
          currentPage={this.state.currentPage}
          displayCount
          single={list.label}
          plural={list.plural}
          pageSize={DEFAULT_PAGE_SIZE}
          onChange={page => {
            this.setState(() => ({
              currentPage: page,
              skip: (page - 1) * DEFAULT_PAGE_SIZE,
            }));
          }}
        />
      </FlexGroup>
    );

    return (
      <div
        css={{
          marginBottom: gridSize * 2,
          marginTop: gridSize,
          visibility: this.itemsCount ? 'visible' : 'hidden',
        }}
      >
        {isManaging ? managementUI : paginationUI}
        {this.renderUpdateModal()}
      </div>
    );
  }
  getSearchRef = ref => {
    this.input = ref;
  };

  render() {
    const { list, adminPath } = this.props;
    const {
      displayedFields,
      selectedFilters,
      isFullWidth,
      isManaging,
      sortDirection,
      sortBy,
      search,
      selectedItems,
      skip,
    } = this.state;

    const sort = `${sortDirection === 'DESC' ? '-' : ''}${sortBy.path}`;

    const query = getQuery({
      fields: displayedFields,
      list,
      search,
      sort,
      skip,
      // Future enhancement; move this to state, and let the user selec the page
      // size.
      first: DEFAULT_PAGE_SIZE,
    });

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

            // TODO: This doesn't seem like the best way to capture the refetch,
            // but it's not easy to hoist the <Query> further up the hierarchy.
            this.refetch = refetch;

            // Leave the old values intact while new data is loaded
            if (!loading) {
              this.items = data && data[list.listQueryName];
              this.itemsCount =
                data &&
                data[`_${list.listQueryName}Meta`] &&
                data[`_${list.listQueryName}Meta`].count;
            }

            const searchId = 'list-search-input';

            return (
              <Fragment>
                <Container>
                  <H1>
                    {this.itemsCount > 0
                      ? list.formatCount(this.itemsCount)
                      : list.plural}
                    <span>, by</span>
                    <Popout
                      headerTitle="Sort"
                      footerContent={
                        <Note>
                          Hold <Kbd>alt</Kbd> to toggle ascending/descending
                        </Note>
                      }
                      target={
                        <SortButton>
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
                  </H1>

                  <FlexGroup growIndexes={[0]}>
                    <Search
                      isFetching={loading}
                      onClear={this.handleSearchClear}
                      onSubmit={this.handleSearchSubmit}
                      hasValue={search && search.length}
                    >
                      <A11yText tag="label" htmlFor={searchId}>
                        Search {list.plural}
                      </A11yText>
                      <Input
                        autoCapitalize="off"
                        autoComplete="off"
                        autoCorrect="off"
                        id={searchId}
                        innerRef={this.getSearchRef}
                        onChange={this.handleSearch}
                        placeholder="Search"
                        name="item-search"
                        value={search}
                        type="text"
                      />
                    </Search>
                    {ENABLE_DEV_FEATURES ? (
                      <FilterSelect
                        onChange={this.onFilterChange}
                        list={list}
                        fields={list.fields}
                        value={selectedFilters}
                      />
                    ) : null}
                    <Popout buttonLabel="Columns" headerTitle="Columns">
                      <ColumnSelect
                        fields={list.fields}
                        onChange={this.handleSelectedFieldsChange}
                        removeIsAllowed={displayedFields.length > 1}
                        value={displayedFields}
                      />
                    </Popout>
                    {this.renderExpandButton()}
                    <FilterSeparator />
                    <IconButton
                      appearance="create"
                      icon={PlusIcon}
                      onClick={this.openCreateModal}
                    >
                      Create
                    </IconButton>
                  </FlexGroup>

                  {this.renderFilters()}
                  {this.renderPaginationOrManage()}
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
                {this.renderDeleteSelectedItemsModal()}

                <main>
                  <Container isDisabled={isFullWidth}>
                    {this.items ? (
                      <ListTable
                        adminPath={adminPath}
                        fields={displayedFields}
                        isManaging={isManaging}
                        items={this.items}
                        list={list}
                        onChange={refetch}
                        onSelect={this.handleItemSelect}
                        onSelectAll={this.handleSelectAll}
                        selectedItems={selectedItems}
                        noResultsMessage={
                          <span>
                            No {list.plural.toLowerCase()} found matching
                            &ldquo;{search}&rdquo;
                          </span>
                        }
                      />
                    ) : (
                      <PageLoading />
                    )}
                  </Container>
                </main>
              </Fragment>
            );
          }}
        </Query>
      </Fragment>
    );
  }
}

export default withRouter(ListPage);
