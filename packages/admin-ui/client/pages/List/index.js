/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, Suspense, useEffect, useRef, useState } from 'react';
import { Query } from 'react-apollo';

import { IconButton } from '@arch-ui/button';
import { PlusIcon } from '@arch-ui/icons';
import { Container, FlexGroup } from '@arch-ui/layout';
import { Title } from '@arch-ui/typography';

import CreateItemModal from '../../components/CreateItemModal';
import DocTitle from '../../components/DocTitle';
import ListTable from '../../components/ListTable';
import PageError from '../../components/PageError';
import PageLoading from '../../components/PageLoading';
import { deconstructErrorsToDataShape } from '../../util';

import ColumnPopout from './ColumnSelect';
import AddFilterPopout from './Filters/AddFilterPopout';
import ActiveFilters from './Filters/ActiveFilters';
import SortPopout from './SortSelect';
import Pagination from './Pagination';
import Search from './Search';
import Management, { ManageToolbar } from './Management';
import { MoreDropdown } from './MoreDropdown';
import { NoResults } from './NoResults';
import { useListFilter, useListSelect, useListSort, useListUrlState } from './dataHooks';

type Props = {
  adminMeta: Object,
  list: Object,
  routeProps: Object,
};
type LayoutProps = Props & {
  items: Array<Object>,
  itemCount: number,
  itemErrors: Array<Object>,
};

function ListLayout(props: LayoutProps) {
  const { adminMeta, items, itemCount, itemErrors, list, routeProps, query } = props;
  const [isFullWidth, setFullWidth] = useState(false);
  const [showCreateModal, toggleCreateModal] = useState(false);
  const measureElementRef = useRef();

  const { urlState } = useListUrlState(list.key);
  const { filters, onAdd: handleFilterAdd } = useListFilter(list.key);
  // const { items, itemCount, itemErrors } = useListItems(list.key);
  const [sortBy, handleSortChange] = useListSort(list.key);

  const { adminPath } = adminMeta;
  const { history, location } = routeProps;
  const { currentPage, fields, pageSize, search } = urlState;

  const closeCreateModal = () => {
    toggleCreateModal(false);
  };
  const openCreateModal = () => {
    toggleCreateModal(true);
  };

  const [selectedItems, onSelectChange] = useListSelect(items);

  // Mount with Persisted Search
  // ------------------------------
  useEffect(() => {
    const maybePersistedSearch = list.getPersistedSearch();

    if (location.search) {
      if (location.search !== maybePersistedSearch) {
        list.setPersistedSearch(location.search);
      }
    } else if (maybePersistedSearch) {
      history.replace({
        ...location,
        search: maybePersistedSearch,
      });
    }
  }, []);

  // Misc.
  // ------------------------------
  const toggleFullWidth = () => {
    setFullWidth(!isFullWidth);
  };

  const onDeleteSelectedItems = () => {
    query.refetch();
    onSelectChange([]);
  };
  const onDeleteItem = () => {
    query.refetch();
  };
  const onUpdateSelectedItems = () => {
    // coming in https://github.com/keystonejs/keystone-5/pull/961
  };
  const onCreate = ({ data }) => {
    let id = data[list.gqlNames.createMutationName].id;
    history.push(`${adminPath}/${list.path}/${id}`);
    query.refetch();
  };

  // Success
  // ------------------------------
  return (
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
            listKey={list.key}
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
                onChange={onDeleteItem}
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
  );
}

function List(props: Props) {
  const { adminMeta, list, query, routeProps } = props;
  const { urlState } = useListUrlState(list.key);

  // get item data
  let items;
  let itemCount;
  let itemErrors;
  if (query.data[list.gqlNames.listQueryName]) {
    items = query.data[list.gqlNames.listQueryName];
    itemErrors = deconstructErrorsToDataShape(query.data.error)[list.gqlNames.listQueryName];
  }
  if (query.data[list.gqlNames.listQueryMetaName]) {
    itemCount = query.data[list.gqlNames.listQueryMetaName].count;
  }

  const { history, location } = routeProps;

  // Mount with Persisted Search
  // ------------------------------
  useEffect(() => {
    const maybePersistedSearch = list.getPersistedSearch();

    if (location.search) {
      if (location.search !== maybePersistedSearch) {
        list.setPersistedSearch(location.search);
      }
    } else if (maybePersistedSearch) {
      history.replace({
        ...location,
        search: maybePersistedSearch,
      });
    }
  }, []);

  // TODO: put this in some effect to limit calls
  // we want to preload the Field components
  // so that we don't have a waterfall after the data loads
  adminMeta.preloadViews(urlState.fields.map(({ views }) => views && views.Cell).filter(x => x));

  // Error
  // ------------------------------
  // Only show error page if there is no data
  // (ie; there could be partial data + partial errors)
  if (
    query.error &&
    (!query.data ||
      !query.data[list.gqlNames.listQueryName] ||
      !Object.keys(query.data[list.gqlNames.listQueryName]).length)
  ) {
    let message = query.error.message;

    // If there was an error returned by GraphQL, use that message
    // instead
    if (
      query.error.networkError &&
      query.error.networkError.result &&
      query.error.networkError.result.errors &&
      query.error.networkError.result.errors[0]
    ) {
      message = query.error.networkError.result.errors[0].message || message;
    }

    // Special case for when trying to access a non-existent list or a
    // list that is set to `read: false`.
    if (message.startsWith('Cannot query field')) {
      message = `Unable to access list ${list.plural}`;
    }

    return (
      <PageError>
        <p>{message}</p>
      </PageError>
    );
  }

  // Success
  // ------------------------------
  return (
    <Fragment>
      <DocTitle>{list.plural}</DocTitle>
      <ListLayout
        {...props}
        items={items}
        itemCount={itemCount}
        itemErrors={itemErrors}
        query={query}
      />
    </Fragment>
  );
}

export default function ListData(props: Props) {
  const { list } = props;
  const { urlState } = useListUrlState(list.key);

  const { currentPage, fields, filters, pageSize, search, sortBy } = urlState;
  const orderBy = `${sortBy.field.path}_${sortBy.direction}`;
  const first = pageSize;
  const skip = (currentPage - 1) * pageSize;

  const query = list.getQuery({ fields, filters, search, orderBy, skip, first });

  return (
    <Query query={query} fetchPolicy="cache-and-network" errorPolicy="all">
      {res => <List query={res} {...props} />}
    </Query>
  );
}
