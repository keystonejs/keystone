/* @jsx jsx */

import { Fragment, HTMLAttributes, ReactNode, useEffect, useMemo, useState } from 'react';

import { ListMeta } from '@keystone-next/types';
import { Button } from '@keystone-ui/button';
import { Box, Center, Heading, jsx, Stack, useTheme } from '@keystone-ui/core';
import { CheckboxControl } from '@keystone-ui/fields';
import { ArrowRightCircleIcon } from '@keystone-ui/icons/icons/ArrowRightCircleIcon';
import { LoadingDots } from '@keystone-ui/loading';
import { AlertDialog, DrawerController } from '@keystone-ui/modals';
import { useToasts } from '@keystone-ui/toast';

import { gql, TypedDocumentNode, useMutation, useQuery } from '../../apollo';
import { CellLink } from '../../components';
import { CreateItemDrawer } from '../../components/CreateItemDrawer';
import { PageContainer, HEADER_HEIGHT } from '../../components/PageContainer';
import { useList } from '../../context';
import { Link, useRouter } from '../../router';
import {
  getRootGraphQLFieldsFromFieldController,
  DataGetter,
  DeepNullable,
  makeDataGetter,
} from '@keystone-next/admin-ui-utils';
import { FieldSelection } from './FieldSelection';
import { FilterAdd } from './FilterAdd';
import { FilterList } from './FilterList';
import { PaginationLabel, Pagination } from './pagination';
import { SortSelection } from './SortSelection';
import { useFilters } from './useFilters';
import { useSelectedFields } from './useSelectedFields';
import { useSort } from './useSort';

type ListPageProps = {
  listKey: string;
};

let listMetaGraphqlQuery: TypedDocumentNode<
  {
    keystone: {
      adminMeta: {
        list: {
          hideCreate: boolean;
          hideDelete: boolean;

          fields: {
            path: string;
            listView: {
              fieldMode: 'read' | 'hidden';
            };
          }[];
        } | null;
      };
    };
  },
  { listKey: string }
> = gql`
  query($listKey: String!) {
    keystone {
      adminMeta {
        list(key: $listKey) {
          hideDelete
          hideCreate
          fields {
            path
            listView {
              fieldMode
            }
          }
        }
      }
    }
  }
`;

function useQueryParamsFromLocalStorage(listKey: string) {
  const router = useRouter();
  const localStorageKey = `keystone.list.${listKey}.list.page.info`;
  useEffect(() => {
    let hasSomeQueryParamsWhichAreAboutListPage = Object.keys(router.query).some(
      x => x.startsWith('!') || x === 'page' || x === 'pageSize' || x === 'fields'
    );
    if (!hasSomeQueryParamsWhichAreAboutListPage) {
      const queryParamsFromLocalStorage = localStorage.getItem(localStorageKey);
      let parsed;
      try {
        parsed = JSON.parse(queryParamsFromLocalStorage!);
      } catch (err) {}
      if (parsed) {
        router.replace({
          query: {
            ...router.query,
            ...parsed,
          },
        });
      }
    }
  }, [localStorageKey]);
  useEffect(() => {
    let queryParamsToSerialize: Record<string, string> = {};
    Object.keys(router.query).forEach(key => {
      if (key.startsWith('!') || key === 'page' || key === 'pageSize' || key === 'fields') {
        queryParamsToSerialize[key] = router.query[key] as string;
      }
    });
    if (Object.keys(queryParamsToSerialize).length) {
      localStorage.setItem(
        `keystone.list.${listKey}.list.page.info`,
        JSON.stringify(queryParamsToSerialize)
      );
    } else {
      localStorage.removeItem(`keystone.list.${listKey}.list.page.info`);
    }
  }, [localStorageKey, router]);
}

export const ListPage = ({ listKey }: ListPageProps) => {
  const list = useList(listKey);

  const { query } = useRouter();

  useQueryParamsFromLocalStorage(listKey);

  let currentPage =
    typeof query.page === 'string' && !Number.isNaN(parseInt(query.page)) ? Number(query.page) : 1;
  let pageSize =
    typeof query.pageSize === 'string' && !Number.isNaN(parseInt(query.pageSize))
      ? parseInt(query.pageSize)
      : list.pageSize;

  const sort = useSort(list);

  const filters = useFilters(list);

  let metaQuery = useQuery(listMetaGraphqlQuery, { variables: { listKey } });

  let listViewFieldModesByField = useMemo(() => {
    let listViewFieldModesByField: Record<string, 'read' | 'hidden'> = {};
    metaQuery.data?.keystone.adminMeta.list?.fields.forEach(field => {
      listViewFieldModesByField[field.path] = field.listView.fieldMode;
    });
    return listViewFieldModesByField;
  }, [metaQuery.data?.keystone.adminMeta.list?.fields]);

  let selectedFields = useSelectedFields(list, listViewFieldModesByField);

  let { data: newData, error: newError, refetch, loading } = useQuery(
    useMemo(() => {
      let selectedGqlFields = [...selectedFields]
        .map(fieldPath => {
          return list.fields[fieldPath].controller.graphqlSelection;
        })
        .join('\n');
      return gql`
      query ($where: ${list.gqlNames.whereInputName}, $first: Int!, $skip: Int!, $sortBy: [${
        list.gqlNames.listSortName
      }!]) {
        items: ${
          list.gqlNames.listQueryName
        }(where: $where,first: $first, skip: $skip, sortBy: $sortBy) {
          ${
            // TODO: maybe namespace all the fields instead of doing this
            selectedFields.has('id') ? '' : 'id'
          }
          ${selectedGqlFields}
        }
        meta: ${list.gqlNames.listQueryMetaName}(where: $where) {
          count
        }
      }
    `;
    }, [list, selectedFields]),
    {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
      variables: {
        where: filters.where,
        first: pageSize,
        skip: (currentPage - 1) * pageSize,
        sortBy: sort ? [`${sort.field}_${sort.direction}`] : undefined,
      },
    }
  );

  let [dataState, setDataState] = useState({ data: newData, error: newError });

  if (newData && dataState.data !== newData) {
    setDataState({
      data: newData,
      error: newError,
    });
  }

  const { data, error } = dataState;

  const dataGetter = makeDataGetter<
    DeepNullable<{
      meta: { count: number };
      items: { id: string; [key: string]: any }[];
    }>
  >(data, error?.graphQLErrors);

  const [selectedItemsState, setSelectedItems] = useState(() => ({
    itemsFromServer: undefined as any,
    selectedItems: new Set() as ReadonlySet<string>,
  }));

  // this removes the selected items which no longer exist when the data changes
  // because someone goes to another page, changes filters or etc.
  if (data && data.items && selectedItemsState.itemsFromServer !== data.items) {
    const newSelectedItems = new Set<string>();
    data.items.forEach((item: any) => {
      if (selectedItemsState.selectedItems.has(item.id)) {
        newSelectedItems.add(item.id);
      }
    });
    setSelectedItems({
      itemsFromServer: data.items,
      selectedItems: newSelectedItems,
    });
  }

  const theme = useTheme();
  const showCreate = !(metaQuery.data?.keystone.adminMeta.list?.hideCreate ?? true) || null;

  return (
    <PageContainer header={<ListPageHeader listKey={listKey} />}>
      {metaQuery.error ? (
        // TODO: Show errors nicely and with information
        'Error...'
      ) : data && metaQuery.data ? (
        <Fragment>
          <Stack across gap="medium" align="center" marginTop="xlarge">
            {showCreate && <CreateButton listKey={listKey} />}
            {data.meta.count || filters.filters.length ? <FilterAdd listKey={listKey} /> : null}
            {filters.filters.length ? <FilterList filters={filters.filters} list={list} /> : null}
          </Stack>
          {data.meta.count ? (
            <Fragment>
              <ResultsSummaryContainer>
                {(() => {
                  const selectedItems = selectedItemsState.selectedItems;
                  const selectedItemsCount = selectedItems.size;
                  if (selectedItemsCount) {
                    return (
                      <Fragment>
                        <span css={{ marginRight: theme.spacing.small }}>
                          Selected {selectedItemsCount} of {data.items.length}
                        </span>
                        {!(metaQuery.data?.keystone.adminMeta.list?.hideDelete ?? true) && (
                          <DeleteManyButton
                            list={list}
                            selectedItems={selectedItems}
                            refetch={refetch}
                          />
                        )}
                      </Fragment>
                    );
                  }
                  return (
                    <Fragment>
                      <PaginationLabel
                        currentPage={currentPage}
                        pageSize={pageSize}
                        plural={list.plural}
                        singular={list.singular}
                        total={data.meta.count}
                      />
                      , sorted by <SortSelection list={list} />
                      with{' '}
                      <FieldSelection
                        list={list}
                        fieldModesByFieldPath={listViewFieldModesByField}
                      />{' '}
                      {loading && (
                        <LoadingDots label="Loading item data" size="small" tone="active" />
                      )}
                    </Fragment>
                  );
                })()}
              </ResultsSummaryContainer>
              <ListTable
                count={data.meta.count}
                currentPage={currentPage}
                itemsGetter={dataGetter.get('items')}
                listKey={listKey}
                pageSize={pageSize}
                selectedFields={selectedFields}
                sort={sort}
                selectedItems={selectedItemsState.selectedItems}
                onSelectedItemsChange={selectedItems => {
                  setSelectedItems({
                    itemsFromServer: selectedItemsState.itemsFromServer,
                    selectedItems,
                  });
                }}
              />
            </Fragment>
          ) : (
            <ResultsSummaryContainer>No {list.plural} found.</ResultsSummaryContainer>
          )}
        </Fragment>
      ) : (
        <Center css={{ height: `calc(100vh - ${HEADER_HEIGHT}px)` }}>
          <LoadingDots label="Loading item data" size="large" tone="passive" />
        </Center>
      )}
    </PageContainer>
  );
};

const CreateButton = ({ listKey }: { listKey: string }) => {
  const list = useList(listKey);
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <Fragment>
      <Button
        disabled={isCreateModalOpen}
        onClick={() => {
          setIsCreateModalOpen(true);
        }}
        tone="active"
        size="small"
        weight="bold"
      >
        Create {list.singular}
      </Button>
      <DrawerController isOpen={isCreateModalOpen}>
        <CreateItemDrawer
          listKey={listKey}
          onCreate={({ id }) => {
            router.push(`/${list.path}/[id]`, `/${list.path}/${id}`);
          }}
          onClose={() => {
            setIsCreateModalOpen(false);
          }}
        />
      </DrawerController>
    </Fragment>
  );
};

const ListPageHeader = ({ listKey }: { listKey: string }) => {
  const list = useList(listKey);
  return (
    <Fragment>
      <div
        css={{
          alignItems: 'center',
          display: 'flex',
          flex: 1,
          justifyContent: 'space-between',
        }}
      >
        <Heading type="h3">{list.label}</Heading>
        {/* <CreateButton listKey={listKey} /> */}
      </div>
    </Fragment>
  );
};

const ResultsSummaryContainer = ({ children }: { children: ReactNode }) => (
  <p
    css={{
      // TODO: don't do this
      // (this is to make it so things don't move when a user selects an item)
      minHeight: 38,

      display: 'flex',
      alignItems: 'center',
    }}
  >
    {children}
  </p>
);

const SortDirectionArrow = ({ direction }: { direction: 'ASC' | 'DESC' }) => {
  const size = '0.25em';
  return (
    <span
      css={{
        borderLeft: `${size} solid transparent`,
        borderRight: `${size} solid transparent`,
        borderTop: `${size} solid`,
        display: 'inline-block',
        height: 0,
        marginLeft: '0.33em',
        marginTop: '-0.125em',
        verticalAlign: 'middle',
        width: 0,
        transform: `rotate(${direction === 'DESC' ? '0deg' : '180deg'})`,
      }}
    />
  );
};

function DeleteManyButton({
  selectedItems,
  list,
  refetch,
}: {
  selectedItems: ReadonlySet<string>;
  list: ListMeta;
  refetch: () => void;
}) {
  const [deleteItems, deleteItemsState] = useMutation(
    useMemo(
      () =>
        gql`
  mutation($ids: [ID!]!) {
    ${list.gqlNames.deleteManyMutationName}(ids: $ids) {
      id
    }
  }
`,
      [list, selectedItems]
    )
  );
  const [isOpen, setIsOpen] = useState(false);
  const toasts = useToasts();
  return (
    <Fragment>
      <Button
        isLoading={deleteItemsState.loading}
        tone="negative"
        onClick={async () => {
          setIsOpen(true);
        }}
      >
        Delete
      </Button>
      <AlertDialog
        // TODO: change the copy in the title and body of the modal
        isOpen={isOpen}
        title="Delete Confirmation"
        tone="negative"
        actions={{
          confirm: {
            label: 'Delete',
            action: async () => {
              await deleteItems({
                variables: { ids: [...selectedItems] },
              }).catch(err => {
                toasts.addToast({
                  title: 'Failed to delete items',
                  message: err.message,
                  tone: 'negative',
                });
              });
              toasts.addToast({
                title: 'Deleted items successfully',
                tone: 'positive',
              });
              refetch();
            },
          },
          cancel: {
            label: 'Cancel',
            action: () => {
              setIsOpen(false);
            },
          },
        }}
      >
        Are you sure you want to delete {selectedItems.size}{' '}
        {selectedItems.size === 1 ? list.singular : list.plural}?
      </AlertDialog>
    </Fragment>
  );
}

function ListTable({
  selectedFields,
  listKey,
  itemsGetter,
  count,
  sort,
  currentPage,
  pageSize,
  selectedItems,
  onSelectedItemsChange,
}: {
  selectedFields: ReturnType<typeof useSelectedFields>;
  listKey: string;
  itemsGetter: DataGetter<DeepNullable<{ id: string; [key: string]: any }[]>>;
  count: number;
  sort: { field: string; direction: 'ASC' | 'DESC' } | null;
  currentPage: number;
  pageSize: number;
  selectedItems: ReadonlySet<string>;
  onSelectedItemsChange(selectedItems: ReadonlySet<string>): void;
}) {
  const list = useList(listKey);
  const { query } = useRouter();
  const shouldShowLinkIcon = !list.fields[selectedFields.keys().next().value].views.Cell
    .supportsLinkTo;

  return (
    <Box paddingBottom="xlarge">
      <TableContainer>
        <colgroup>
          <col width="30" />
          {shouldShowLinkIcon && <col width="30" />}
          {[...selectedFields].map(path => (
            <col key={path} />
          ))}
        </colgroup>
        <TableHeaderRow>
          <TableHeaderCell css={{ paddingLeft: 0 }}>
            <label
              css={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'start',
                cursor: 'pointer',
              }}
            >
              <CheckboxControl
                size="small"
                checked={selectedItems.size === itemsGetter.data?.length}
                css={{ cursor: 'default' }}
                onChange={() => {
                  const newSelectedItems = new Set<string>();
                  if (selectedItems.size !== itemsGetter.data?.length) {
                    itemsGetter.data?.forEach(item => {
                      if (item !== null && item.id !== null) {
                        newSelectedItems.add(item.id);
                      }
                    });
                  }
                  onSelectedItemsChange(newSelectedItems);
                }}
              />
            </label>
          </TableHeaderCell>
          {shouldShowLinkIcon && <TableHeaderCell />}
          {[...selectedFields].map(path => {
            const label = list.fields[path].label;
            if (!list.fields[path].isOrderable) {
              return <TableHeaderCell key={path}>{label}</TableHeaderCell>;
            }
            return (
              <TableHeaderCell key={path}>
                <Link
                  css={{
                    display: 'block',
                    textDecoration: 'none',
                    color: 'inherit',
                    ':hover': { color: 'inherit' },
                  }}
                  href={{
                    query: {
                      ...query,
                      sortBy: sort?.field === path && sort.direction === 'ASC' ? `-${path}` : path,
                    },
                  }}
                >
                  {label}
                  {sort?.field === path && <SortDirectionArrow direction={sort.direction} />}
                </Link>
              </TableHeaderCell>
            );
          })}
        </TableHeaderRow>
        <tbody>
          {(itemsGetter.data ?? []).map((_, index) => {
            const itemGetter = itemsGetter.get(index);
            if (itemGetter.data === null || itemGetter.data.id === null) {
              if (itemGetter.errors) {
                return (
                  <tr css={{ color: 'red' }} key={`index:${index}`}>
                    {itemGetter.errors[0].message}
                  </tr>
                );
              }
              return null;
            }
            const itemId = itemGetter.data.id;
            return (
              <tr key={itemId || `index:${index}`}>
                <TableBodyCell>
                  <label
                    css={{
                      display: 'flex',
                      minHeight: 38,
                      alignItems: 'center',
                      justifyContent: 'start',
                      // cursor: 'pointer',
                    }}
                  >
                    <CheckboxControl
                      size="small"
                      checked={selectedItems.has(itemId)}
                      css={{ cursor: 'default' }}
                      onChange={() => {
                        const newSelectedItems = new Set(selectedItems);
                        if (selectedItems.has(itemId)) {
                          newSelectedItems.delete(itemId);
                        } else {
                          newSelectedItems.add(itemId);
                        }
                        onSelectedItemsChange(newSelectedItems);
                      }}
                    />
                  </label>
                </TableBodyCell>
                {shouldShowLinkIcon && (
                  <TableBodyCell>
                    <Link
                      css={{
                        textDecoration: 'none',
                        minHeight: 38,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      href={`/${list.path}/[id]`}
                      as={`/${list.path}/${encodeURIComponent(itemId)}`}
                    >
                      <ArrowRightCircleIcon size="smallish" aria-label="Go to item" />
                    </Link>
                  </TableBodyCell>
                )}
                {[...selectedFields].map((path, i) => {
                  const field = list.fields[path];
                  let { Cell } = list.fields[path].views;
                  const itemForField: Record<string, any> = {};
                  for (const graphqlField of getRootGraphQLFieldsFromFieldController(
                    field.controller
                  )) {
                    const fieldGetter = itemGetter.get(graphqlField);
                    if (fieldGetter.errors) {
                      const errorMessage = fieldGetter.errors[0].message;
                      return (
                        <TableBodyCell css={{ color: 'red' }} key={path}>
                          {i === 0 && Cell.supportsLinkTo ? (
                            <CellLink
                              href={`/${list.path}/[id]`}
                              as={`/${list.path}/${encodeURIComponent(itemId)}`}
                            >
                              {errorMessage}
                            </CellLink>
                          ) : (
                            errorMessage
                          )}
                        </TableBodyCell>
                      );
                    }
                    itemForField[graphqlField] = fieldGetter.data;
                  }

                  return (
                    <TableBodyCell key={path}>
                      <Cell
                        field={field.controller}
                        item={itemForField}
                        linkTo={
                          i === 0 && Cell.supportsLinkTo
                            ? {
                                href: `/${list.path}/[id]`,
                                as: `/${list.path}/${encodeURIComponent(itemId)}`,
                              }
                            : undefined
                        }
                      />
                    </TableBodyCell>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </TableContainer>
      <Pagination listKey={listKey} total={count} currentPage={currentPage} pageSize={pageSize} />
    </Box>
  );
}

const TableContainer = ({ children }: { children: ReactNode }) => {
  return (
    <table
      css={{
        minWidth: '100%',
        tableLayout: 'fixed',
        'tr:last-child td': { borderBottomWidth: 0 },
      }}
      cellPadding="0"
      cellSpacing="0"
    >
      {children}
    </table>
  );
};

const TableHeaderRow = ({ children }: { children: ReactNode }) => {
  return (
    <thead>
      <tr>{children}</tr>
    </thead>
  );
};

const TableHeaderCell = (props: HTMLAttributes<HTMLElement>) => {
  const { colors, spacing, typography } = useTheme();
  return (
    <th
      css={{
        backgroundColor: colors.background,
        borderBottom: `2px solid ${colors.border}`,
        color: colors.foregroundDim,
        fontSize: typography.fontSize.medium,
        fontWeight: typography.fontWeight.medium,
        padding: spacing.small,
        textAlign: 'left',
        position: 'sticky',
        top: 0,
      }}
      {...props}
    />
  );
};

const TableBodyCell = (props: HTMLAttributes<HTMLElement>) => {
  const { colors, typography } = useTheme();
  return (
    <td
      css={{
        borderBottom: `1px solid ${colors.border}`,
        fontSize: typography.fontSize.medium,
      }}
      {...props}
    />
  );
};
