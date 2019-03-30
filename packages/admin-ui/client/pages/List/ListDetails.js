/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component, createRef, Fragment, Suspense } from 'react';
import { withRouter } from 'react-router-dom';

import {
  FoldIcon,
  KebabVerticalIcon,
  PlusIcon,
  SearchIcon,
  UnfoldIcon,
  XIcon,
  ZapIcon,
} from '@arch-ui/icons';
import { Input } from '@arch-ui/input';
import { Container, FlexGroup, CONTAINER_GUTTER, CONTAINER_WIDTH } from '@arch-ui/layout';
import { A11yText, Title } from '@arch-ui/typography';
import { Button, IconButton } from '@arch-ui/button';
import { LoadingSpinner } from '@arch-ui/loading';
import Dropdown from '@arch-ui/dropdown';
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

// ==============================
// Styled Components
// ==============================

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
        target={props => (
          <IconButton {...props} variant="nuance" icon={KebabVerticalIcon} id="ks-list-dropdown">
            <A11yText>Show more...</A11yText>
          </IconButton>
        )}
        items={items}
      />
    );
  }

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
            <Title as="h1" margin="both">
              {itemsCount > 0 ? list.formatCount(itemsCount) : list.plural}
              <span>, by</span>
              <SortPopout listKey={list.key} />
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
