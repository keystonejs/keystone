/* global ENABLE_DEV_FEATURES */
import React, { Component, createRef, Fragment } from 'react';
import styled from 'react-emotion';
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
import { colors, gridSize } from '@keystonejs/ui/src/theme';

import ListTable from '../../components/ListTable';
import CreateItemModal from '../../components/CreateItemModal';
import PageLoading from '../../components/PageLoading';
import { Popout, DisclosureArrow } from '../../components/Popout';

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

const ToolbarSeparator = styled.div({
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
  startManaging = () => {
    this.setState({ isManaging: true });
  };
  stopManaging = () => {
    this.setState({ isManaging: false, selectedItems: [] }, () => {
      if (!this.manageButton) return;
      this.manageButton.current.focus();
    });
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
    let id = data[list.createMutationName].id;
    history.push(`${adminPath}/${list.path}/${id}`);
  };

  // ==============================
  // Renderers
  // ==============================

  renderExpandButton() {
    if (window && window.innerWidth < CONTAINER_WIDTH) return null;

    const { isFullWidth } = this.state;
    const Icon = isFullWidth ? FoldIcon : UnfoldIcon;
    const text = isFullWidth ? 'Collapse' : 'Expand';

    // Note: we return an array here instead of a <Fragment> because the
    // <FlexGroup> component it is rendered into passes props to its children
    return [
      <ToolbarSeparator key="expand-separator" />,
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
      handleSearchChange,
      handleSearchClear,
      handleSearchSubmit,
      handleSortChange,
      items,
      itemsCount,
      list,
      pageSize,
      query,
      search,
      sortBy,
    } = this.props;
    const {
      isFullWidth,
      isManaging,
      selectedItems,
      showCreateModal,
    } = this.state;

    const searchId = 'list-search-input';

    return (
      <Fragment>
        <Container>
          <H1>
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
          </H1>

          <FlexGroup growIndexes={[0]}>
            <Search
              isFetching={query.loading}
              onClear={handleSearchClear}
              onSubmit={handleSearchSubmit}
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
                onChange={handleSearchChange}
                placeholder="Search"
                name="item-search"
                value={search}
                type="text"
              />
            </Search>
            {ENABLE_DEV_FEATURES ? (
              <AddFilterPopout
                existingFilters={filters}
                fields={list.fields}
                onChange={handleFilterAdd}
              />
            ) : null}
            <Popout buttonLabel="Columns" headerTitle="Columns">
              <ColumnSelect
                fields={list.fields}
                onChange={handleFieldChange}
                removeIsAllowed={fields.length > 1}
                value={fields}
              />
            </Popout>
            {this.renderExpandButton()}
            <ToolbarSeparator />
            <IconButton
              appearance="create"
              icon={PlusIcon}
              onClick={this.openCreateModal}
            >
              Create
            </IconButton>
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

        <CreateItemModal
          isOpen={showCreateModal}
          list={list}
          onClose={this.closeCreateModal}
          onCreate={this.onCreate}
        />

        <main>
          <Container isDisabled={isFullWidth}>
            {items ? (
              <ListTable
                adminPath={adminPath}
                fields={fields}
                isManaging={isManaging}
                items={items}
                list={list}
                onChange={query.refetch}
                onSelect={this.handleItemSelect}
                onSelectAll={this.handleItemSelectAll}
                selectedItems={selectedItems}
                noResultsMessage={
                  filters ? (
                    <span>
                      No {list.plural.toLowerCase()} found matching the{' '}
                      {filters.length > 1 ? 'filters' : 'filter'}
                    </span>
                  ) : (
                    <span>
                      No {list.plural.toLowerCase()} found matching &ldquo;{
                        search
                      }&rdquo;
                    </span>
                  )
                }
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
