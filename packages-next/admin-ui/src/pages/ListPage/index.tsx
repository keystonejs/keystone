/* @jsx jsx */

import { useQuery, gql, useMutation, TypedDocumentNode } from '../../apollo';
import { Button } from '@keystone-ui/button';
import { Box, H1, jsx, Stack, useTheme } from '@keystone-ui/core';
import { Fragment, HTMLAttributes, ReactNode, useMemo, useState } from 'react';
import { ArrowRightCircleIcon } from '@keystone-ui/icons/icons/ArrowRightCircleIcon';
import { PageContainer } from '../../components/PageContainer';
import { useList } from '../../context';
import { useRouter, Link } from '../../router';
import { CellLink } from '../../components';
import { getPaginationLabel, Pagination } from './pagination';
import { useFilters } from './useFilters';
import { useSelectedFields } from './useSelectedFields';
import { CheckboxControl } from '@keystone-ui/fields';
import { DataGetter, DeepNullable, makeDataGetter } from '../../utils/dataGetter';
import { getRootGraphQLFieldsFromFieldController } from '../../utils/getRootGraphQLFieldsFromFieldController';
import { CreateForm } from '../../components/CreateForm';
import { FieldSelection } from './FieldSelection';
import { FilterAdd } from './FilterAdd';
import { FilterList } from './FilterList';

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
            createView: {
              fieldMode: 'edit' | 'hidden';
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
            createView {
              fieldMode
            }
          }
        }
      }
    }
  }
`;

export const ListPage = ({ listKey }: ListPageProps) => {
  const list = useList(listKey);

  const { query } = useRouter();

  let currentPage =
    typeof query.page === 'string' && !Number.isNaN(parseInt(query.page)) ? Number(query.page) : 1;
  let pageSize =
    typeof query.pageSize === 'string' && !Number.isNaN(parseInt(query.pageSize))
      ? parseInt(query.pageSize)
      : list.pageSize;

  let sortByFromUrl = typeof query.sortBy === 'string' ? query.sortBy : '';

  const sort = useMemo(() => {
    if (sortByFromUrl === '') return null;
    let direction: 'ASC' | 'DESC' = 'ASC';
    let sortByField = sortByFromUrl;
    if (sortByFromUrl.charAt(0) === '-') {
      sortByField = sortByFromUrl.substr(1);
      direction = 'DESC';
    }
    if (!list.fields[sortByField].isOrderable) return null;
    return {
      field: sortByField,
      direction,
    };
  }, [sortByFromUrl]);
  const filters = useFilters(listKey);

  let metaQuery = useQuery(listMetaGraphqlQuery, { variables: { listKey } });

  let listViewFieldModesByField = useMemo(() => {
    let listViewFieldModesByField: Record<string, 'read' | 'hidden'> = {};
    metaQuery.data?.keystone.adminMeta.list?.fields.forEach(field => {
      listViewFieldModesByField[field.path] = field.listView.fieldMode;
    });
    return listViewFieldModesByField;
  }, [metaQuery.data?.keystone.adminMeta.list?.fields]);

  let createViewFieldModesByField = useMemo(() => {
    let createViewFieldModesByField: Record<string, 'edit' | 'hidden'> = {};
    metaQuery.data?.keystone.adminMeta.list?.fields.forEach(field => {
      createViewFieldModesByField[field.path] = field.createView.fieldMode;
    });
    return createViewFieldModesByField;
  }, [metaQuery.data?.keystone.adminMeta.list?.fields]);

  let selectedFields = useSelectedFields(listKey, listViewFieldModesByField);

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
      [list, selectedFields]
    )
  );

  let { data, error, refetch } = useQuery(
    useMemo(() => {
      let selectedGqlFields = selectedFields.fields
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
          id
          ${selectedFields.includeLabel ? '_label_' : ''}
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

  const dataGetter = makeDataGetter<
    DeepNullable<{
      meta: { count: number };
      items: { id: string; _label_: string; [key: string]: any }[];
    }>
  >(data, error?.graphQLErrors);

  const [selectedItemsState, setSelectedItems] = useState(() => ({
    itemsFromServer: undefined as any,
    selectedItems: {} as Record<string, true>,
  }));
  // this removes the selected items which no longer exist when the data changes
  // because someone goes to another page, changes filters or etc.
  if (data && selectedItemsState.itemsFromServer !== data.items) {
    const newSelectedItems: Record<string, true> = {};
    data.items.forEach((item: any) => {
      if (selectedItemsState.selectedItems[item.id] !== undefined) {
        newSelectedItems[item.id] = true;
      }
    });
    setSelectedItems({
      itemsFromServer: data.items,
      selectedItems: newSelectedItems,
    });
  }

  const { spacing } = useTheme();

  return (
    <PageContainer>
      <ListPageHeader
        createViewFieldModes={createViewFieldModesByField}
        listKey={listKey}
        showCreate={!(metaQuery.data?.keystone.adminMeta.list?.hideCreate ?? true)}
      />
      <Stack gap="xxlarge" across>
        <FieldSelection listKey={listKey} fieldModesByFieldPath={listViewFieldModesByField} />{' '}
        <FilterAdd listKey={listKey} />
      </Stack>

      <p
        css={{
          // TODO: don't do this
          // (this is to make it so things don't move when a user selects an item)
          minHeight: 38,

          display: 'flex',
          alignItems: 'center',
        }}
      >
        {data && metaQuery.data
          ? (() => {
              const selectedItems = selectedItemsState.selectedItems;
              const selectedItemsCount = Object.keys(selectedItems).length;
              if (selectedItemsCount) {
                return (
                  <Fragment>
                    Selected {selectedItemsCount} of {data.items.length}
                    {!(metaQuery.data?.keystone.adminMeta.list?.hideDelete ?? true) && (
                      <Button
                        css={{ marginLeft: spacing.small }}
                        isLoading={deleteItemsState.loading}
                        tone="negative"
                        onClick={async () => {
                          // TODO: confirmation modal
                          // TODO: handle errors
                          await deleteItems({
                            variables: { ids: Object.keys(selectedItemsState.selectedItems) },
                          });
                          refetch();
                        }}
                      >
                        Delete
                      </Button>
                    )}
                  </Fragment>
                );
              }
              const selectedFieldCount =
                selectedFields.fields.length + Number(selectedFields.includeLabel);
              return (
                <Fragment>
                  {getPaginationLabel({
                    currentPage,
                    pageSize,
                    plural: list.plural,
                    singular: list.singular,
                    total: data.meta.count,
                  })}{' '}
                  with {selectedFieldCount} column{selectedFieldCount === 1 ? '' : 's'}
                </Fragment>
              );
            })()
          : ' '}
      </p>
      {filters.filters.length ? <FilterList filters={filters.filters} list={list} /> : null}
      {metaQuery.error ? (
        // TODO: Show errors nicely and with information
        'Error...'
      ) : data && metaQuery.data ? (
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
      ) : (
        'Loading...'
      )}
    </PageContainer>
  );
};

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
  itemsGetter: DataGetter<DeepNullable<{ id: string; _label_: string; [key: string]: any }[]>>;
  count: number;
  sort: { field: string; direction: 'ASC' | 'DESC' } | null;
  currentPage: number;
  pageSize: number;
  selectedItems: Record<string, true>;
  onSelectedItemsChange(selectedItems: Record<string, true>): void;
}) {
  const list = useList(listKey);
  const { query } = useRouter();
  const shouldShowLinkIcon =
    !selectedFields.includeLabel &&
    !list.fields[selectedFields.fields[0]].views.Cell.supportsLinkTo;

  const selectedItemsCount = Object.keys(selectedItems).length;
  return (
    <Fragment>
      <TableContainer>
        <col width="30" />
        {shouldShowLinkIcon && <col width="30" />}
        {selectedFields.includeLabel && <col />}
        {selectedFields.fields.map(path => (
          <col key={path} />
        ))}
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
                checked={selectedItemsCount === itemsGetter.data?.length}
                css={{ cursor: 'default' }}
                onChange={() => {
                  const selectedItems: Record<string, true> = {};
                  if (selectedItemsCount !== itemsGetter.data?.length) {
                    itemsGetter.data?.forEach(item => {
                      if (item !== null && item.id !== null) {
                        selectedItems[item.id] = true;
                      }
                    });
                  }
                  onSelectedItemsChange(selectedItems);
                }}
              />
            </label>
          </TableHeaderCell>
          {shouldShowLinkIcon && <TableHeaderCell />}
          {selectedFields.includeLabel && <TableHeaderCell>Label</TableHeaderCell>}
          {selectedFields.fields.map(path => {
            const label = list.fields[path].label;
            if (!list.fields[path].isOrderable) {
              return <TableHeaderCell key={path}>{label}</TableHeaderCell>;
            }
            return (
              <TableHeaderCell>
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
            const item = itemGetter.data;
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
                      checked={selectedItems[itemId] !== undefined}
                      css={{ cursor: 'default' }}
                      onChange={() => {
                        const newSelectedItems = { ...selectedItems };
                        if (selectedItems[itemId] === undefined) {
                          newSelectedItems[itemId] = true;
                        } else {
                          delete newSelectedItems[itemId];
                        }
                        onSelectedItemsChange(newSelectedItems);
                      }}
                    />
                  </label>
                </TableBodyCell>
                {selectedFields.includeLabel && (
                  <TableBodyCell>
                    <CellLink
                      css={{
                        fontFamily:
                          list.labelIsId || item._label_ === null ? 'monospace' : undefined,
                      }}
                      href={`/${list.path}/[id]`}
                      as={`/${list.path}/${encodeURIComponent(itemId)}`}
                    >
                      {item._label_ ?? itemId}
                    </CellLink>
                  </TableBodyCell>
                )}
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
                {selectedFields.fields.map((path, i) => {
                  const field = list.fields[path];
                  let { Cell } = list.fields[path].views;
                  const itemForField: Record<string, any> = {};
                  for (const graphqlField of getRootGraphQLFieldsFromFieldController(
                    field.controller
                  )) {
                    const fieldGetter = itemGetter.get(graphqlField);
                    if (fieldGetter.errors) {
                      return (
                        <TableBodyCell css={{ color: 'red' }} key={path}>
                          {fieldGetter.errors[0].message}
                        </TableBodyCell>
                      );
                    }
                    itemForField[graphqlField] = fieldGetter.data;
                  }

                  return (
                    <TableBodyCell key={path}>
                      <Cell
                        item={itemForField}
                        path={path}
                        linkTo={
                          i === 0 && !selectedFields.includeLabel && Cell.supportsLinkTo
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
    </Fragment>
  );
}

const ListPageHeader = ({
  listKey,
  showCreate,
  createViewFieldModes,
}: {
  listKey: string;
  showCreate: boolean;
  createViewFieldModes: Record<string, 'edit' | 'hidden'>;
}) => {
  const list = useList(listKey);
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  return (
    <Fragment>
      <Stack
        across
        marginY="large"
        gap="medium"
        css={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <H1>{list.label}</H1>
        {showCreate && (
          <Button
            onClick={() => {
              setIsCreateModalOpen(true);
            }}
            tone="positive"
          >
            Create
          </Button>
        )}
      </Stack>
      {isCreateModalOpen && (
        <CreateForm
          listKey={listKey}
          fieldModes={createViewFieldModes}
          onCreate={id => {
            router.push(`/${list.path}/[id]`, `/${list.path}/${id}`);
          }}
          onClose={() => {
            setIsCreateModalOpen(false);
          }}
        />
      )}
    </Fragment>
  );
};

const TableContainer = ({ children }: { children: ReactNode }) => {
  const { colors, shadow } = useTheme();
  return (
    <Box
      padding="large"
      rounding="medium"
      css={{
        background: colors.background,
        boxShadow: shadow.s200,
      }}
    >
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
    </Box>
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
        borderBottom: `2px solid ${colors.border}`,
        color: colors.foregroundDim,
        fontSize: typography.fontSize.large,
        fontWeight: typography.fontWeight.regular,
        padding: spacing.small,
        textAlign: 'left',
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
