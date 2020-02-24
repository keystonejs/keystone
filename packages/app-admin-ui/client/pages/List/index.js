/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Fragment, useEffect, useRef, Suspense } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { useList } from '../../providers/List';

import { IconButton } from '@arch-ui/button';
import { PlusIcon } from '@arch-ui/icons';
import { Container, FlexGroup } from '@arch-ui/layout';
import { colors, gridSize } from '@arch-ui/theme';
import { PageTitle } from '@arch-ui/typography';
import { Button } from '@arch-ui/button';
import { KebabHorizontalIcon } from '@arch-ui/icons';
import Tooltip from '@arch-ui/tooltip';
import { applyRefs } from 'apply-ref';
import { LoadingIndicator } from '@arch-ui/loading';

import CreateItemModal from '../../components/CreateItemModal';
import DocTitle from '../../components/DocTitle';
import ListTable from '../../components/ListTable';
import PageError from '../../components/PageError';
import { DisclosureArrow } from '../../components/Popout';

import ColumnPopout from './ColumnSelect';
import ActiveFilters from './Filters/ActiveFilters';
import SortPopout from './SortSelect';
import Pagination, { getPaginationLabel } from './Pagination';
import Search from './Search';
import Management, { ManageToolbar } from './Management';
import { useListFilter, useListSelect, useListSort, useListUrlState } from './dataHooks';
import { captureSuspensePromises } from '@keystonejs/utils';

const HeaderInset = props => (
  <div css={{ paddingLeft: gridSize * 2, paddingRight: gridSize * 2 }} {...props} />
);

export function ListLayout(props) {
  const { adminMeta, items, itemCount, queryErrors, routeProps, query } = props;
  const measureElementRef = useRef();
  const { list, openCreateItemModal } = useList();
  const { urlState } = useListUrlState(list.key);
  const { filters } = useListFilter(list.key);
  const [sortBy, handleSortChange] = useListSort(list.key);

  const { adminPath } = adminMeta;
  const { history, location } = routeProps;
  const { currentPage, fields, pageSize, search } = urlState;

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

  const onDeleteSelectedItems = () => {
    query.refetch();
    onSelectChange([]);
  };
  const onDeleteItem = () => {
    query.refetch();
  };
  const onUpdateSelectedItems = () => {
    query.refetch();
  };
  const onCreate = ({ data }) => {
    const id = data[list.gqlNames.createMutationName].id;
    query.refetch().then(() => {
      history.push(`${adminPath}/${list.path}/${id}`);
    });
  };

  // Success
  // ------------------------------

  const cypressCreateId = 'list-page-create-button';
  const cypressFiltersId = 'ks-list-active-filters';

  const Render = ({ children }) => children();
  return (
    <main>
      <div ref={measureElementRef} />

      <Container isFullWidth>
        <HeaderInset>
          <FlexGroup align="center" justify="space-between">
            <PageTitle>{list.plural}</PageTitle>
            {list.access.create ? (
              <IconButton
                appearance="primary"
                icon={PlusIcon}
                onClick={openCreateItemModal}
                id={cypressCreateId}
              >
                Create
              </IconButton>
            ) : null}
          </FlexGroup>
          <div
            css={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap' }}
            id={cypressFiltersId}
          >
            <Suspense fallback={<LoadingIndicator css={{ height: '3em' }} size={12} />}>
              <Render>
                {() => {
                  captureSuspensePromises(
                    fields
                      .filter(field => field.path !== '_label_')
                      .map(field => () => field.initCellView())
                  );
                  return <Search list={list} isLoading={query.loading} />;
                }}
              </Render>
            </Suspense>
            <ActiveFilters list={list} />
          </div>

          <ManageToolbar isVisible css={{ marginLeft: 2 }}>
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
            ) : items && items.length ? (
              <FlexGroup align="center" growIndexes={[0]}>
                <div
                  css={{
                    alignItems: 'center',
                    color: colors.N40,
                    display: 'flex',
                    marginTop: gridSize - 2,
                  }}
                >
                  <span id="ks-pagination-count">
                    {getPaginationLabel({
                      currentPage: currentPage,
                      pageSize: pageSize,
                      plural: list.plural,
                      singular: list.singular,
                      total: itemCount,
                    })}
                    ,
                  </span>
                  {sortBy ? (
                    <Fragment>
                      <span css={{ paddingLeft: '0.5ex' }}>sorted by</span>
                      <SortPopout listKey={list.key} />
                    </Fragment>
                  ) : (
                    ''
                  )}
                  <span css={{ paddingLeft: '0.5ex' }}>with</span>
                  <ColumnPopout
                    listKey={list.key}
                    target={handlers => (
                      <Button
                        variant="subtle"
                        appearance="primary"
                        spacing="cozy"
                        id="ks-column-button"
                        {...handlers}
                      >
                        {fields.length} Columns
                        <DisclosureArrow />
                      </Button>
                    )}
                  />
                </div>
                <FlexGroup align="center" css={{ marginLeft: '1em' }}>
                  <Suspense fallback={<LoadingIndicator css={{ height: '3em' }} size={12} />}>
                    <Render>
                      {() => {
                        captureSuspensePromises(
                          fields
                            .filter(field => field.path !== '_label_')
                            .map(field => () => field.initCellView())
                        );
                        return <Pagination listKey={list.key} isLoading={query.loading} />;
                      }}
                    </Render>
                  </Suspense>
                </FlexGroup>
              </FlexGroup>
            ) : null}
          </ManageToolbar>
        </HeaderInset>
      </Container>

      <CreateItemModal onCreate={onCreate} />

      <Container isFullWidth>
        <ListTable
          {...props}
          adminPath={adminPath}
          columnControl={
            <ColumnPopout
              listKey={list.key}
              target={handlers => (
                <Tooltip placement="top" content="Columns">
                  {ref => (
                    <Button
                      variant="subtle"
                      css={{
                        background: 0,
                        border: 0,
                        color: colors.N40,
                      }}
                      {...handlers}
                      ref={applyRefs(handlers.ref, ref)}
                    >
                      <KebabHorizontalIcon />
                    </Button>
                  )}
                </Tooltip>
              )}
            />
          }
          fields={fields}
          handleSortChange={handleSortChange}
          isFullWidth
          items={items}
          queryErrors={queryErrors}
          list={list}
          onChange={onDeleteItem}
          onSelectChange={onSelectChange}
          selectedItems={selectedItems}
          sortBy={sortBy}
          currentPage={currentPage}
          filters={filters}
          search={search}
        />
      </Container>
    </main>
  );
}

export function List(props) {
  const { list, query, routeProps } = props;

  // get item data
  const items = query.data && query.data[list.gqlNames.listQueryName];
  const queryErrors = query.data && query.data.error;
  let itemCount;
  if (query.data && query.data[list.gqlNames.listQueryMetaName]) {
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
      <DocTitle title={list.plural} />
      <ListLayout
        {...props}
        items={items}
        itemCount={itemCount}
        query={query}
        queryErrors={queryErrors}
      />
    </Fragment>
  );
}

export default function ListData(props) {
  const { list } = props;
  const { urlState } = useListUrlState(list.key);

  const { currentPage, fields, filters, pageSize, search, sortBy } = urlState;
  const orderBy = sortBy ? `${sortBy.field.path}_${sortBy.direction}` : null;
  const first = pageSize;
  const skip = (currentPage - 1) * pageSize;

  const query = list.getQuery({ fields, filters, search, orderBy, skip, first });
  const res = useQuery(query, { fetchPolicy: 'cache-and-network', errorPolicy: 'all' });

  return <List query={res} {...props} />;
}
