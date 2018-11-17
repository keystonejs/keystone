/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component, createRef, Fragment } from 'react';
import styled from '@emotion/styled';
import { withRouter } from 'react-router-dom';

import {
  FoldIcon,
  KebabVerticalIcon,
  PlusIcon,
  SearchIcon,
  UnfoldIcon,
  XIcon,
  ZapIcon,
} from '@voussoir/icons';
import { Input } from '@voussoir/ui/src/primitives/forms';
import {
  Container,
  FlexGroup,
  CONTAINER_GUTTER,
  CONTAINER_WIDTH,
} from '@voussoir/ui/src/primitives/layout';
import { A11yText, Kbd, Title } from '@voussoir/ui/src/primitives/typography';
import { Button, IconButton } from '@voussoir/ui/src/primitives/buttons';
import { LoadingSpinner } from '@voussoir/ui/src/primitives/loading';
import { Dropdown } from '@voussoir/ui/src/primitives/modals';
import { colors } from '@voussoir/ui/src/theme';

import ListTable from '../../components/ListTable';
import CreateItemModal from '../../components/CreateItemModal';
import PageLoading from '../../components/PageLoading';
import { Popout, DisclosureArrow } from '../../components/Popout';
import ContainerQuery from '../../components/ContainerQuery';

import ColumnSelect from './ColumnSelect';
import AddFilterPopout from './Filters/AddFilterPopout';
import ActiveFilters from './Filters/ActiveFilters';
import SortSelect, { SortButton } from './SortSelect';
import Pagination from './Pagination';
import Management, { ManageToolbar } from './Management';
import type { SortByType } from './DataProvider';

// ==============================
// Styled Components
// ==============================

// const ToolbarSeparator = styled.div({
//   backgroundColor: 'rgba(0,0,0,0.1)',
//   height: '100%',
//   width: 1,
// });

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
          alignItems: 'center',
          color: colors.N30,
          cursor: 'pointer',
          display: 'flex',
          height: 34,
          justifyContent: 'center',
          pointerEvents: hasValue ? 'all' : 'none',
          position: 'absolute',
          right: 0,
          top: 0,
          width: 40,

          ':hover': {
            color: hasValue ? colors.text : colors.N30,
          },
        }}
      >
        {isLoading ? <LoadingSpinner size={16} /> : <Icon onClick={hasValue ? onClear : null} />}
      </div>
    </form>
  );
};

type GenericFn = (*) => void;

type Props = {
  list: Object,
  query: {
    data: Object,
    error: Object,
    loading: boolean,
    refetch: GenericFn,
  },
  currentPage: number,
  fields: Array<Object>,
  handleFieldChange: GenericFn,
  handlePageChange: GenericFn,
  handleSearchChange: GenericFn,
  handleSearchClear: GenericFn,
  handleSearchSubmit: GenericFn,
  handleSortChange: GenericFn,
  items: Array<Object>,
  itemsCount: number,
  pageSize: number,
  search: string,
  skip: number,
  sortBy: SortByType,
};
type State = {
  isFullWidth: boolean,
  isManaging: boolean,
  selectedItems: Array<Object>,
  showCreateModal: boolean,
};

class ListDetails extends Component<Props, State> {
  state = {
    isFullWidth: false,
    isManaging: false,
    selectedItems: [],
    showCreateModal: false,
    searchValue: this.props.search,
  };

  // ==============================
  // Refs
  // ==============================

  manageButton = createRef();
  sortPopoutRef = createRef();

  toggleFullWidth = () => {
    this.setState(state => ({ isFullWidth: !state.isFullWidth }));
  };

  closeCreateModal = () => this.setState({ showCreateModal: false });
  openCreateModal = () => this.setState({ showCreateModal: true });

  // ==============================
  // Search
  // ==============================
  handleSearchChange = ({ target: { value } }) => {
    this.setState({ searchValue: value }, () => {
      this.props.handleSearchChange(value);
    });
  };
  handleSearchClear = () => {
    this.setState({ searchValue: '' });
    this.props.handleSearchClear();
    this.searchInput.focus();
  };
  handleReset = () => {
    this.setState({ searchValue: '' });
    this.props.handleReset();
  };
  handleSearchSubmit = event => {
    event.preventDefault();
    this.props.handleSearchSubmit();
  };

  // ==============================
  // Management
  // ==============================

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
  handleItemSelectAll = (selectedItems: Array<string>) => {
    this.setState({ selectedItems });
  };
  handleManageKeyDown = ({ key }: Event) => {
    if (key !== 'Escape') return;
    this.stopManaging();
  };
  startManaging = () => {
    this.setState({ isManaging: true });
    document.addEventListener('keydown', this.handleManageKeyDown, false);
  };
  stopManaging = () => {
    this.setState({ isManaging: false, selectedItems: [] }, () => {
      if (!this.manageButton) return;
      this.manageButton.current.focus();
    });
    document.removeEventListener('keydown', this.handleManageKeyDown, false);
  };
  onToggleManage = () => {
    const fn = this.state.isManaging ? this.stopManaging : this.startManaging;
    fn();
  };
  onDeleteSelectedItems = () => {
    const { query } = this.props;
    if (query.refetch) query.refetch();
    this.setState({ selectedItems: [] });
  };
  onCreate = ({ data }) => {
    let { list, adminPath, history } = this.props;
    let id = data[list.gqlNames.createMutationName].id;
    history.push(`${adminPath}/${list.path}/${id}`);
  };

  // ==============================
  // Renderers
  // ==============================

  getNoResultsMessage = () => {
    const { filters, itemsCount, list, search, currentPage, handlePageReset } = this.props;

    if (filters && filters.length) {
      return (
        <span>
          No {list.plural.toLowerCase()} found matching the{' '}
          {filters.length > 1 ? 'filters' : 'filter'}
        </span>
      );
    }
    if (search && search.length) {
      return (
        <span>
          No {list.plural.toLowerCase()} found matching &ldquo;
          {search}
          &rdquo;
        </span>
      );
    }

    if (currentPage !== 1) {
      return (
        <div>
          <p>
            Not enough {list.plural.toLowerCase()} found to show page {currentPage}.
          </p>
          <Button variant="ghost" onClick={handlePageReset}>
            Show first page
          </Button>
        </div>
      );
    }

    if (itemsCount === 0) {
      return <span>No {list.plural.toLowerCase()} to display yet...</span>;
    }

    return null;
  };

  renderMoreDropdown(queryWidth) {
    const { isFullWidth } = this.state;
    const TableIcon = isFullWidth ? FoldIcon : UnfoldIcon;
    const tableToggleIsAvailable = queryWidth > CONTAINER_WIDTH + CONTAINER_GUTTER * 2;

    const items = [
      {
        content: 'Reset filters, cols, etc.',
        icon: <ZapIcon />,
        id: 'ks-list-dropdown-reset', // for cypress tests
        onClick: this.handleReset,
      },
      {
        content: isFullWidth ? 'Collapse table' : 'Expand table',
        icon: <TableIcon css={{ transform: 'rotate(90deg)' }} />,
        isDisabled: !tableToggleIsAvailable,
        onClick: this.toggleFullWidth,
      },
    ];

    return (
      <Dropdown
        align="right"
        target={
          <IconButton variant="nuance" icon={KebabVerticalIcon} id="ks-list-dropdown">
            <A11yText>Show more...</A11yText>
          </IconButton>
        }
        items={items}
      />
    );
  }

  render() {
    const {
      adminPath,
      currentPage,
      fields,
      filters,
      handleFieldChange,
      handleFilterAdd,
      handleFilterRemove,
      handleFilterRemoveAll,
      handleFilterUpdate,
      handlePageChange,
      handleSortChange,
      items,
      itemsCount,
      itemsErrors,
      list,
      pageSize,
      query,
      sortBy,
    } = this.props;
    const { isFullWidth, isManaging, selectedItems, showCreateModal, searchValue } = this.state;

    const searchId = 'ks-list-search-input';

    return (
      <Fragment>
        <main>
          <ContainerQuery>
            {({ width }) => (
              <Container isFullWidth={isFullWidth}>
                <Title as="h1" margin="both">
                  {itemsCount > 0 ? list.formatCount(itemsCount) : list.plural}
                  <span>, by</span>
                  <Popout
                    innerRef={this.sortPopoutRef}
                    headerTitle="Sort"
                    footerContent={
                      <Note>
                        Hold <Kbd>alt</Kbd> to toggle ascending/descending
                      </Note>
                    }
                    target={
                      <SortButton>
                        {sortBy.field.label.toLowerCase()}
                        <DisclosureArrow size="0.2em" />
                      </SortButton>
                    }
                  >
                    <SortSelect
                      popoutRef={this.sortPopoutRef}
                      fields={list.fields}
                      onChange={handleSortChange}
                      value={sortBy}
                    />
                  </Popout>
                </Title>

                <FlexGroup growIndexes={[0]}>
                  <Search
                    isFetching={query.loading}
                    onClear={this.handleSearchClear}
                    onSubmit={this.handleSearchSubmit}
                    hasValue={searchValue && searchValue.length}
                  >
                    <A11yText tag="label" htmlFor={searchId}>
                      Search {list.plural}
                    </A11yText>
                    <Input
                      autoCapitalize="off"
                      autoComplete="off"
                      autoCorrect="off"
                      id={searchId}
                      onChange={this.handleSearchChange}
                      placeholder="Search"
                      name="item-search"
                      value={searchValue}
                      type="text"
                      ref={el => (this.searchInput = el)}
                    />
                  </Search>
                  <AddFilterPopout
                    existingFilters={filters}
                    fields={list.fields}
                    onChange={handleFilterAdd}
                  />
                  <Popout buttonLabel="Columns" headerTitle="Columns">
                    <ColumnSelect
                      fields={list.fields}
                      onChange={handleFieldChange}
                      removeIsAllowed={fields.length > 1}
                      value={fields}
                    />
                  </Popout>

                  {list.access.create ? (
                    <IconButton appearance="create" icon={PlusIcon} onClick={this.openCreateModal}>
                      Create
                    </IconButton>
                  ) : null}
                  {this.renderMoreDropdown(width)}
                </FlexGroup>

                <ActiveFilters
                  filterList={filters}
                  onUpdate={handleFilterUpdate}
                  onRemove={handleFilterRemove}
                  onClear={handleFilterRemoveAll}
                />

                <ManageToolbar isVisible={!!itemsCount}>
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
                      currentPage={currentPage}
                      getManageButton={this.manageButton}
                      itemsCount={itemsCount}
                      list={list}
                      onChangePage={handlePageChange}
                      onToggleManage={this.onToggleManage}
                      pageSize={pageSize}
                    />
                  )}
                </ManageToolbar>
              </Container>
            )}
          </ContainerQuery>

          <CreateItemModal
            isOpen={showCreateModal}
            list={list}
            onClose={this.closeCreateModal}
            onCreate={this.onCreate}
          />

          <Container isFullWidth={isFullWidth}>
            {items ? (
              <ListTable
                adminPath={adminPath}
                fields={fields}
                isFullWidth={isFullWidth}
                isManaging={isManaging}
                items={items}
                itemsErrors={itemsErrors}
                list={list}
                onChange={query.refetch}
                onSelect={this.handleItemSelect}
                onSelectAll={this.handleItemSelectAll}
                handleSortChange={handleSortChange}
                sortBy={sortBy}
                selectedItems={selectedItems}
                noResultsMessage={this.getNoResultsMessage()}
              />
            ) : (
              <PageLoading />
            )}
          </Container>
        </main>
      </Fragment>
    );
  }
}

export default withRouter(ListDetails);
