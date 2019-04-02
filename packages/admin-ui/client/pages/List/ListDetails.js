/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Component, createRef, Fragment, Suspense } from 'react';
import styled from '@emotion/styled';
import { withRouter } from 'react-router-dom';

import { KebabHorizontalIcon, PlusIcon, SearchIcon, XIcon } from '@arch-ui/icons';
import { Input } from '@arch-ui/input';
import { Container, FlexGroup } from '@arch-ui/layout';
import { A11yText, Kbd, Title } from '@arch-ui/typography';
import { Button, IconButton } from '@arch-ui/button';
import { LoadingSpinner } from '@arch-ui/loading';
import { Card, Canvas } from '@arch-ui/card';
import { colors, gridSize } from '@arch-ui/theme';

import AnimateHeight from '../../components/AnimateHeight';
import ListTable from '../../components/ListTable';
import CreateItemModal from '../../components/CreateItemModal';
import PageLoading from '../../components/PageLoading';
import { Popout, DisclosureArrow } from '../../components/Popout';
import { withAdminMeta } from '../../providers/AdminMeta';

import ColumnSelect from './ColumnSelect';
import AddFilterPopout from './Filters/AddFilterPopout';
import ActiveFilters from './Filters/ActiveFilters';
import SortSelect, { SortButton } from './SortSelect';
import Pagination from './Pagination';
import Management, { ManageToolbar } from './Management';
import type { SortByType } from './DataProvider';
import { MoreDropdown } from './MoreDropdown';

// ==============================
// Styled Components
// ==============================

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
    <form css={{ position: 'relative', flexShrink: 0 }} autoComplete="off" onSubmit={onSubmit}>
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
  selectedItems: Array<Object>,
  showCreateModal: boolean,
};

function bodyUserSelect(val) {
  document.body.style.WebkitUserSelect = val;
  document.body.style.MozUserSelect = val;
  document.body.style.msUserSelect = val;
  document.body.style.userSelect = val;
}

class ListDetails extends Component<Props, State> {
  state = {
    isFullWidth: true,
    selectedItems: [],
    showCreateModal: false,
    searchValue: this.props.search,
  };
  lastChecked = null;
  shiftIsDown = false;

  // ==============================
  // Refs
  // ==============================

  sortPopoutRef = createRef();
  measureElementRef = createRef();

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
  }

  toggleFullWidth = () => {
    this.setState(state => ({ isFullWidth: !state.isFullWidth }));
  };
  handleKeyDown = event => {
    if (event.key === 'Shift') {
      if (this.state.selectedItems.length > 0) {
        bodyUserSelect('none');
      }
      this.shiftIsDown = true;
    }
  };
  handleKeyUp = event => {
    if (event.key === 'Shift') {
      if (this.state.selectedItems.length > 0) {
        bodyUserSelect(null);
      }
      this.shiftIsDown = false;
    }
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

  handleItemSelect = (itemId: string) => {
    let selectedItems = this.state.selectedItems.slice(0);

    if (this.shiftIsDown && this.lastChecked) {
      const itemIds = this.props.items.map(i => i.id);
      const from = itemIds.indexOf(itemId);
      const to = itemIds.indexOf(this.lastChecked);
      const start = Math.min(from, to);
      const end = Math.max(from, to) + 1;

      itemIds
        .slice(start, end)
        .filter(id => id !== this.lastChecked)
        .forEach(id => {
          if (!selectedItems.includes(this.lastChecked)) {
            selectedItems = selectedItems.filter(existingId => existingId !== id);
          } else {
            selectedItems.push(id);
          }
        });

      // lazy ensure unique
      const uniqueItems = [...new Set(selectedItems)];
      this.setState({ selectedItems: uniqueItems });
    } else {
      if (selectedItems.includes(itemId)) {
        selectedItems = selectedItems.filter(existingId => existingId !== itemId);
      } else {
        selectedItems.push(itemId);
      }

      this.setState({ selectedItems });
    }

    this.lastChecked = itemId;
  };
  handleItemSelectAll = (selectedItems: Array<string>) => {
    this.setState({ selectedItems });
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

  render() {
    const {
      adminMeta,
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
    const { isFullWidth, selectedItems, showCreateModal, searchValue } = this.state;

    const searchId = 'ks-list-search-input';

    // we want to preload the Field components
    // so that we don't have a waterfall after the data loads
    adminMeta.preloadViews(fields.map(({ views }) => views && views.Cell).filter(x => x));

    return (
      <Fragment>
        <main>
          <div ref={this.measureElementRef} />

          <Container isFullWidth={isFullWidth}>
            <FlexGroup align="center" growIndexes={[0]}>
              <h1 style={{ marginTop: 14 }}>{list.plural}</h1>
              {list.access.create ? (
                <IconButton
                  variant="ghost"
                  appearance="primary"
                  icon={PlusIcon}
                  onClick={this.openCreateModal}
                >
                  Create
                </IconButton>
              ) : null}
            </FlexGroup>

            <div css={{ display: 'flex', flexWrap: 'wrap', marginBottom: 24 }}>
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
                  css={{ borderRadius: '2em' }}
                  id={searchId}
                  onChange={this.handleSearchChange}
                  placeholder="Search"
                  name="item-search"
                  value={searchValue}
                  type="text"
                  ref={el => (this.searchInput = el)}
                />
              </Search>
              <ActiveFilters
                fields={list.fields}
                filterList={filters}
                onAdd={handleFilterAdd}
                onUpdate={handleFilterUpdate}
                onRemove={handleFilterRemove}
                onClear={handleFilterRemoveAll}
              />

              {/* <MoreDropdown
                measureRef={this.measureElementRef}
                isFullWidth={isFullWidth}
                onFullWidthToggle={this.toggleFullWidth}
                onReset={this.handleReset}
              /> */}
            </div>
          </Container>

          <CreateItemModal
            isOpen={showCreateModal}
            list={list}
            onClose={this.closeCreateModal}
            onCreate={this.onCreate}
          />

          <Container isFullWidth={isFullWidth}>
            {items ? (
              <Suspense fallback={<PageLoading />}>
                <Card>
                  <div css={{ fontSize: '0.85rem', height: 32 }}>
                    {selectedItems.length ? (
                      <Management
                        list={list}
                        onDeleteMany={this.onDeleteSelectedItems}
                        onUpdateMany={this.onUpdate}
                        pageSize={pageSize}
                        selectedItems={selectedItems}
                        totalItems={itemsCount}
                      />
                    ) : (
                      <FlexGroup align="center">
                        <Popout
                          innerRef={this.sortPopoutRef}
                          headerTitle="Sort"
                          footerContent={
                            <Note>
                              Hold <Kbd>alt</Kbd> to toggle ascending/descending
                            </Note>
                          }
                          target={handlers => (
                            <SortButton {...handlers}>
                              Sort: "{sortBy.field.label.toLowerCase()}"
                              <DisclosureArrow size="0.2rem" />
                            </SortButton>
                          )}
                        >
                          <SortSelect
                            popoutRef={this.sortPopoutRef}
                            fields={list.fields}
                            onChange={handleSortChange}
                            value={sortBy}
                          />
                        </Popout>
                        <Popout
                          target={handlers => (
                            <SortButton {...handlers}>
                              Columns
                              <DisclosureArrow size="0.2rem" />
                            </SortButton>
                          )}
                          headerTitle="Columns"
                        >
                          <ColumnSelect
                            fields={list.fields}
                            onChange={handleFieldChange}
                            removeIsAllowed={fields.length > 1}
                            value={fields}
                          />
                        </Popout>
                        <div />
                        <Pagination
                          isLoading={query.loading}
                          currentPage={currentPage}
                          itemsCount={itemsCount}
                          list={list}
                          onChangePage={handlePageChange}
                          pageSize={pageSize}
                        />
                      </FlexGroup>
                    )}
                  </div>
                  <ListTable
                    adminPath={adminPath}
                    columnControl={null}
                    fields={fields}
                    isFullWidth={isFullWidth}
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
                </Card>
              </Suspense>
            ) : (
              <PageLoading />
            )}
          </Container>
        </main>
      </Fragment>
    );
  }
}

export default withAdminMeta(withRouter(ListDetails));
