/* global ENABLE_DEV_FEATURES */
import React, { Component, Fragment } from 'react';
import styled from 'react-emotion';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { withRouter } from 'react-router-dom';

import {
  FoldIcon,
  PlusIcon,
  SearchIcon,
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
import { LoadingSpinner } from '@keystonejs/ui/src/primitives/loading';
import { Pill } from '@keystonejs/ui/src/primitives/pill';
import { colors, gridSize } from '@keystonejs/ui/src/theme';

import AnimateHeight from '../../components/AnimateHeight';
import ListTable from '../../components/ListTable';
import CreateItemModal from '../../components/CreateItemModal';
import Nav from '../../components/Nav';
import DocTitle from '../../components/DocTitle';
import PageLoading from '../../components/PageLoading';
import PageError from '../../components/PageError';
import { Popout, DisclosureArrow } from '../../components/Popout';

import ColumnSelect from './ColumnSelect';
import AddFilterPopout from './Filters/AddFilterPopout';
import EditFilterPopout from './Filters/EditFilterPopout';
import SortSelect, { SortButton } from './SortSelect';
import Pagination from './Pagination';
import Management, { ManageToolbar } from './Management';

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

type Fn = any => any;
type Filter = {
  field: { label: string, list: Object, path: string, type: string },
  filter: { type: string, label: string, getInitialValue: Fn },
  label: string,
  value: string,
};
type Props = {
  list: Object,
};
type State = {
  displayedFields: Array<Object>,
  selectedFilters: Array<Filter>,
  isFullWidth: boolean,
  isManaging: boolean,
  selectedItems: Array<Object>,
  sortDirection: string,
  sortBy: string,
  search: string,
  showCreateModal: boolean,
  showUpdateModal: boolean,
  showDeleteSelectedItemsModal: boolean,
  skip: number,
  currentPage: number,
};

class ListPage extends Component<Props, State> {
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
    this.setState({ isManaging: true });
  };
  stopManaging = () => {
    this.setState({ isManaging: false, selectedItems: [] }, () => {
      if (!this.manageButton) return;
      this.manageButton.focus();
    });
  };
  onToggleManage = () => {
    const fn = this.state.isManaging ? this.stopManaging : this.startManaging;
    fn();
  };
  getManageButton = ref => {
    this.manageButton = ref;
  };
  onDeleteSelectedItems = () => {
    if (this.refetch) this.refetch();
    this.setState({ selectedItems: [] });
  };
  onCreate = ({ data }) => {
    let { list, adminPath, history } = this.props;
    let id = data[list.createMutationName].id;
    history.push(`${adminPath}/${list.path}/${id}`);
  };
  removeFilter = value => () => {
    let selectedFilters = this.state.selectedFilters.slice(0);
    selectedFilters = selectedFilters.filter(f => f !== value);

    this.setState({ selectedFilters });
  };
  addFilter = value => {
    let selectedFilters = this.state.selectedFilters.slice(0);
    selectedFilters.push(value);

    this.setState({ selectedFilters });
  };
  updateFilter = updatedFilter => {
    let selectedFilters = this.state.selectedFilters.slice(0);

    const updateIndex = selectedFilters.findIndex(i => {
      return (
        i.field.path === updatedFilter.field.path &&
        i.type === updatedFilter.type
      );
    });

    selectedFilters.splice(updateIndex, 1, updatedFilter);

    this.setState({ selectedFilters });
  };
  onFilterClear = () => {
    this.setState({ selectedFilters: [] });
  };
  onChangePage = page => {
    this.setState({ currentPage: page, skip: (page - 1) * DEFAULT_PAGE_SIZE });
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
    const { selectedFilters } = this.state;
    const pillStyle = { marginBottom: gridSize / 2, marginTop: gridSize / 2 };

    return ENABLE_DEV_FEATURES ? (
      <AnimateHeight>
        <FlexGroup style={{ paddingTop: gridSize }} wrap>
          {selectedFilters.length
            ? selectedFilters.map(filter => {
                const label = filter.field.getFilterLabel(filter, true);
                return (
                  <EditFilterPopout
                    key={label}
                    onChange={this.updateFilter}
                    filter={filter}
                    target={
                      <Pill
                        appearance="primary"
                        onRemove={this.removeFilter(filter)}
                        style={pillStyle}
                      >
                        {label}
                      </Pill>
                    }
                  />
                );
              })
            : null}
          {selectedFilters.length > 1 ? (
            <Pill key="clear" onClick={this.onFilterClear} style={pillStyle}>
              Clear All
            </Pill>
          ) : null}
        </FlexGroup>
      </AnimateHeight>
    ) : null;
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
                          <DisclosureArrow size="0.2em" />
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
                      <AddFilterPopout
                        onChange={this.addFilter}
                        fields={list.fields}
                        existingFilters={selectedFilters}
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

                  <ManageToolbar isVisible={!!this.itemsCount}>
                    {isManaging ? (
                      <Management
                        list={list}
                        onDeleteMany={this.onDeleteSelectedItems}
                        onUpdateMany={this.onUpdate}
                        onToggleManage={this.onToggleManage}
                        selectedItems={selectedItems}
                      />
                    ) : (
                      <Pagination
                        currentPage={this.state.currentPage}
                        itemsCount={this.itemsCount}
                        onChangePage={this.onChangePage}
                        onToggleManage={this.onToggleManage}
                        getManageButton={this.getManageButton}
                        list={list}
                      />
                    )}
                  </ManageToolbar>
                </Container>

                {this.renderCreateModal()}

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
