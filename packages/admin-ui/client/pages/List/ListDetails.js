/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component, createRef, Fragment, Suspense, useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';

import { PlusIcon, SearchIcon, XIcon } from '@arch-ui/icons';
import { Input } from '@arch-ui/input';
import { Container, FlexGroup } from '@arch-ui/layout';
import { A11yText, Title } from '@arch-ui/typography';
import { Button, IconButton } from '@arch-ui/button';
import { LoadingSpinner } from '@arch-ui/loading';
import { colors } from '@arch-ui/theme';

import ListTable from '../../components/ListTable';
import CreateItemModal from '../../components/CreateItemModal';
import PageLoading from '../../components/PageLoading';
import { withAdminMeta } from '../../providers/AdminMeta';

import ColumnPopout from './ColumnSelect';
import AddFilterPopout from './Filters/AddFilterPopout';
import ActiveFilters from './Filters/ActiveFilters';
import SortPopout from './SortSelect';
import Pagination from './Pagination';
import Management, { ManageToolbar } from './Management';
import type { SortByType } from './DataProvider';
import { MoreDropdown } from './MoreDropdown';
import { useList, useListQuery, useListSearch } from './dataHooks';

// ==============================
// Styled Components
// ==============================

const Search = ({ listKey }) => {
  const list = useList(listKey);
  const { searchValue, onChange, onClear, onSubmit } = useListSearch(listKey);
  const [value, setValue] = useState(searchValue);
  const { loading } = useListQuery(listKey);
  const ref = useRef();

  const hasValue = searchValue && searchValue.length;
  const Icon = hasValue ? XIcon : SearchIcon;
  const isLoading = hasValue && loading;

  const handleChange = event => {
    setValue(event.target.value);
    onChange(event.target.value);
  };
  const handleClear = () => {
    if (ref.current) {
      ref.current.focus();
    }
    setValue('');
    onClear();
  };

  const id = 'ks-list-search-input';

  // NOTE: `autoComplete="off"` doesn't behave as expected on `<input />` in
  // webkit, so we apply the attribute to a form tag here.
  return (
    <form css={{ position: 'relative' }} autoComplete="off" onSubmit={onSubmit}>
      <A11yText tag="label" htmlFor={id}>
        Search {list.plural}
      </A11yText>
      <Input
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        id={id}
        onChange={handleChange}
        placeholder="Search"
        name="item-search"
        value={value}
        type="text"
        ref={ref}
      />
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
        {isLoading ? (
          <LoadingSpinner size={16} />
        ) : (
          <Icon onClick={hasValue ? handleClear : null} />
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
    isFullWidth: false,
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

  handleReset = () => {
    this.setState({ searchValue: '' });
    this.props.handleReset();
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
      fields,
      filters,
      handleFilterAdd,
      handleSortChange,
      items,
      itemsCount,
      itemsErrors,
      list,
      pageSize,
      query,
      sortBy,
    } = this.props;
    const { isFullWidth, selectedItems, showCreateModal } = this.state;

    // we want to preload the Field components
    // so that we don't have a waterfall after the data loads
    adminMeta.preloadViews(fields.map(({ views }) => views && views.Cell).filter(x => x));

    return (
      <Fragment>
        <main>
          <div ref={this.measureElementRef} />

          <Container isFullWidth={isFullWidth}>
            <Title as="h1" margin="both">
              {itemsCount > 0 ? list.formatCount(itemsCount) : list.plural}
              <span>, by</span>
              <SortPopout listKey={list.key} />
            </Title>

            <FlexGroup growIndexes={[0]}>
              <Search listKey={list.key} />
              <AddFilterPopout
                listKey={list.key}
                existingFilters={filters}
                fields={list.fields}
                onChange={handleFilterAdd}
              />

              <ColumnPopout listKey={list.key} />

              {list.access.create ? (
                <IconButton appearance="create" icon={PlusIcon} onClick={this.openCreateModal}>
                  Create
                </IconButton>
              ) : null}
              <MoreDropdown
                measureRef={this.measureElementRef}
                isFullWidth={isFullWidth}
                onFullWidthToggle={this.toggleFullWidth}
                onReset={this.handleReset}
              />
            </FlexGroup>

            <ActiveFilters listKey={list.key} />

            <ManageToolbar isVisible={!!itemsCount}>
              {selectedItems.length ? (
                <Management
                  list={list}
                  onDeleteMany={this.onDeleteSelectedItems}
                  onUpdateMany={query.refetch}
                  pageSize={pageSize}
                  selectedItems={selectedItems}
                  totalItems={itemsCount}
                />
              ) : (
                <Pagination listKey={list.key} />
              )}
            </ManageToolbar>
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
                <ListTable
                  adminPath={adminPath}
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
