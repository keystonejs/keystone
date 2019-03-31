/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, Suspense, useRef, useState } from 'react';

import { Button, IconButton } from '@arch-ui/button';
import { InfoIcon, PlusIcon } from '@arch-ui/icons';
import { Container, FlexGroup } from '@arch-ui/layout';
import { colors } from '@arch-ui/theme';
import { Title } from '@arch-ui/typography';

import ListTable from '../../components/ListTable';
import CreateItemModal from '../../components/CreateItemModal';
import PageLoading from '../../components/PageLoading';

import ColumnPopout from './ColumnSelect';
import AddFilterPopout from './Filters/AddFilterPopout';
import ActiveFilters from './Filters/ActiveFilters';
import SortPopout from './SortSelect';
import Pagination from './Pagination';
import Search from './Search';
import Management, { ManageToolbar } from './Management';
import { MoreDropdown } from './MoreDropdown';
import {
  useListFilter,
  useListItems,
  useListQuery,
  useListSelect,
  useListSort,
  useListUrlState,
} from './dataHooks';

type Props = {
  adminMeta: Object,
  list: Object,
  routeProps: Object,
};

export default function ListDetails(props: Props) {
  const { adminMeta, list, routeProps } = props;
  const [isFullWidth, setFullWidth] = useState(false);
  const [showCreateModal, toggleCreateModal] = useState(false);
  const measureElementRef = useRef();

  const { urlState } = useListUrlState(list.key);
  const { filters, onAdd: handleFilterAdd } = useListFilter(list.key);
  const { items, itemCount, itemErrors } = useListItems(list.key);
  const [sortBy, handleSortChange] = useListSort(list.key);
  const query = useListQuery(list.key);

  const { adminPath, preloadViews } = adminMeta;
  const { history } = routeProps;
  const { currentPage, fields, pageSize, search } = urlState;

  const closeCreateModal = () => {
    toggleCreateModal(false);
  };
  const openCreateModal = () => {
    toggleCreateModal(true);
  };

  const [selectedItems, onSelectChange] = useListSelect(items);

  // ==============================
  // Search
  // ==============================

  const handleReset = () => {
    this.setState({ searchValue: '' });
    props.handleReset();
  };

  const toggleFullWidth = () => {
    setFullWidth(!isFullWidth);
  };

  const onDeleteSelectedItems = () => {
    if (query.refetch) query.refetch();
    onSelectChange([]);
  };
  const onUpdateSelectedItems = () => {
    // coming in https://github.com/keystonejs/keystone-5/pull/961
  };
  const onCreate = ({ data }) => {
    let id = data[list.gqlNames.createMutationName].id;
    history.push(`${adminPath}/${list.path}/${id}`);
  };

  // TODO: put this in some effect to limit calls
  // we want to preload the Field components
  // so that we don't have a waterfall after the data loads
  preloadViews(fields.map(({ views }) => views && views.Cell).filter(x => x));

  return (
    <Fragment>
      <main>
        <div ref={measureElementRef} />

        <Container isFullWidth={isFullWidth}>
          <Title as="h1" margin="both">
            {itemCount > 0 ? list.formatCount(itemCount) : list.plural}
            <span>, by</span>
            <SortPopout listKey={list.key} />
          </Title>

          <FlexGroup growIndexes={[0]}>
            <Search list={list} isLoading={query.loading} />
            <AddFilterPopout
              listKey={list.key}
              existingFilters={filters}
              fields={list.fields}
              onChange={handleFilterAdd}
            />

            <ColumnPopout listKey={list.key} />

            {list.access.create ? (
              <IconButton appearance="create" icon={PlusIcon} onClick={openCreateModal}>
                Create
              </IconButton>
            ) : null}
            <MoreDropdown
              measureRef={measureElementRef}
              isFullWidth={isFullWidth}
              onFullWidthToggle={toggleFullWidth}
              onReset={handleReset}
            />
          </FlexGroup>

          <ActiveFilters listKey={list.key} />

          <ManageToolbar isVisible={!!itemCount}>
            {selectedItems.length ? (
              <Management
                list={list}
                onDeleteMany={onDeleteSelectedItems}
                onUpdateMany={onUpdateSelectedItems}
                pageSize={pageSize}
                selectedItems={selectedItems}
                onSelectChange={onSelectChange}
                totalItems={itemCount}
              />
            ) : (
              <Pagination listKey={list.key} isLoading={query.loading} />
            )}
          </ManageToolbar>
        </Container>

        <CreateItemModal
          isOpen={showCreateModal}
          list={list}
          onClose={closeCreateModal}
          onCreate={onCreate}
        />

        <Container isFullWidth={isFullWidth}>
          {items ? (
            <Suspense fallback={<PageLoading />}>
              {items.length ? (
                <ListTable
                  adminPath={adminPath}
                  fields={fields}
                  isFullWidth={isFullWidth}
                  items={items}
                  itemsErrors={itemErrors}
                  list={list}
                  onChange={query.refetch}
                  selectedItems={selectedItems}
                  onSelectChange={onSelectChange}
                  handleSortChange={handleSortChange}
                  sortBy={sortBy}
                  selectedItems={selectedItems}
                />
              ) : (
                <NoResults
                  currentPage={currentPage}
                  filters={filters}
                  handleReset={handleReset}
                  itemCount={itemCount}
                  list={list}
                  search={search}
                />
              )}
            </Suspense>
          ) : (
            <PageLoading />
          )}
        </Container>
      </main>
    </Fragment>
  );
}

// ==============================
// No Results
// ==============================

const NoResultsWrapper = ({ children, ...props }) => (
  <div
    css={{
      alignItems: 'center',
      color: colors.N30,
      display: 'flex',
      flexDirection: 'column',
      fontSize: 32,
      justifyContent: 'center',
      padding: '1em',
      textAlign: 'center',
    }}
    {...props}
  >
    <InfoIcon css={{ height: 48, width: 48, marginBottom: '0.5em' }} />
    {children}
  </div>
);

const NoResults = ({ currentPage, filters, handleReset, itemCount, list, search }) => {
  if (filters && filters.length) {
    return (
      <NoResultsWrapper>
        No {list.plural.toLowerCase()} found matching the{' '}
        {filters.length > 1 ? 'filters' : 'filter'}
      </NoResultsWrapper>
    );
  }
  if (search && search.length) {
    return (
      <NoResultsWrapper>
        No {list.plural.toLowerCase()} found matching &ldquo;
        {search}
        &rdquo;
      </NoResultsWrapper>
    );
  }

  if (currentPage !== 1) {
    return (
      <NoResultsWrapper>
        <p>
          Not enough {list.plural.toLowerCase()} found to show page {currentPage}.
        </p>
        <Button variant="ghost" onClick={handleReset}>
          Show first page
        </Button>
      </NoResultsWrapper>
    );
  }

  if (itemCount === 0) {
    return <NoResultsWrapper>No {list.plural.toLowerCase()} to display yet...</NoResultsWrapper>;
  }

  return null;
};
