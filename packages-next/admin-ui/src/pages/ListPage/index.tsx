/* @jsx jsx */

import { useQuery, gql } from '../../apollo';
import { Button } from '@keystone-ui/button';
import { Box, H1, jsx, Stack, useTheme } from '@keystone-ui/core';
import { Fragment, HTMLAttributes, ReactNode, useMemo, useState } from 'react';
import { LinkIcon } from '@keystone-ui/icons/icons/LinkIcon';
import { PageContainer } from '../../components/PageContainer';
import { useList } from '../../KeystoneContext';
import { useRouter, Link } from '../../router';
import { CellLink } from '../../components';
import { Pagination } from './pagination';
import { useFilters } from './useFilters';
import { useSelectedFields } from './useSelectedFields';
import { CheckboxControl } from '@keystone-ui/fields';

type ListPageProps = {
  listKey: string;
};

const ListPageHeader = ({ listKey }: { listKey: string }) => {
  const list = useList(listKey);
  return (
    <Stack
      across
      marginY="large"
      gap="medium"
      css={{
        display: 'flex',
        flexDirection: 'row',
        // justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <H1>{list.label}</H1>
      <Button tone="positive">Create</Button>
    </Stack>
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
        css={{ minWidth: '100%', 'tr:last-child td': { borderBottomWidth: 0 } }}
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

const TableBodyCell = ({ children }: { children: ReactNode }) => {
  const { colors, typography } = useTheme();
  return (
    <td
      css={{
        borderBottom: `1px solid ${colors.border}`,
        fontSize: typography.fontSize.medium,
      }}
    >
      {children}
    </td>
  );
};

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
  const selectedFields = useSelectedFields(listKey);

  let { data, error } = useQuery(
    useMemo(() => {
      let selectedGqlFields = selectedFields.fields
        .map(fieldPath => {
          return list.fields[fieldPath].controller.graphqlSelection;
        })
        .join('\n');
      return gql`
      query($where: ${list.gqlNames.whereInputName}, $first: Int!, $skip: Int!, $sortBy: [${
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
      variables: {
        where: filters.where,
        first: pageSize,
        skip: (currentPage - 1) * pageSize,
        sortBy: sort ? [`${sort.field}_${sort.direction}`] : undefined,
      },
    }
  );

  return (
    <PageContainer>
      <ListPageHeader listKey={listKey} />
      <p>
        {data
          ? (() => {
              const selectedFieldCount =
                selectedFields.fields.length + Number(selectedFields.includeLabel);
              return (
                <Fragment>
                  Showing {data.items.length}{' '}
                  {data.items.length === 1 ? list.singular : list.plural} with {selectedFieldCount}{' '}
                  column{selectedFieldCount === 1 ? '' : 's'}
                </Fragment>
              );
            })()
          : ' '}
      </p>
      {filters.filters.length ? (
        <p>
          Filters:
          <ul>
            {filters.filters.map(filter => {
              const field = list.fields[filter.field];
              const { [`!${filter.field}_${filter.type}`]: _ignore, ...queryToKeep } = query;
              return (
                <li key={`${filter.field}_${filter.type}`}>
                  {field.label}{' '}
                  {field.controller.filter!.format({
                    label: field.controller.filter!.types[filter.type].label,
                    type: filter.type,
                    value: filter.value,
                  })}
                  <Link href={{ query: queryToKeep }}>Remove</Link>
                </li>
              );
            })}
          </ul>
        </p>
      ) : null}
      {error ? (
        // TODO: Show errors nicely and with information
        'Error...'
      ) : data ? (
        <ListTable
          count={data.meta.count}
          currentPage={currentPage}
          items={data.items}
          listKey={listKey}
          pageSize={pageSize}
          selectedFields={selectedFields}
          sort={sort}
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
  items,
  count,
  sort,
  currentPage,
  pageSize,
}: {
  selectedFields: ReturnType<typeof useSelectedFields>;
  listKey: string;
  items: Record<string, any>[];
  count: number;
  sort: { field: string; direction: 'ASC' | 'DESC' } | null;
  currentPage: number;
  pageSize: number;
}) {
  const list = useList(listKey);
  const { query } = useRouter();
  const shouldShowNonCellLink =
    !selectedFields.includeLabel &&
    !list.fields[selectedFields.fields[0]].views.Cell.supportsLinkTo;
  let [selectedItemsState, setSelectedItems] = useState(() => ({
    itemsFromServer: items,
    selectedItems: {} as Record<string, true>,
  }));
  if (selectedItemsState.itemsFromServer !== items) {
    setSelectedItems({
      itemsFromServer: items,
      selectedItems: {},
    });
  }
  const selectedItemsCount = Object.keys(selectedItemsState.selectedItems).length;
  return (
    <Fragment>
      <TableContainer>
        <TableHeaderRow>
          <TableHeaderCell css={{ paddingLeft: 0 }}>
            <label>
              <CheckboxControl
                checked={selectedItemsCount === items.length}
                onChange={() => {
                  const selectedItems: Record<string, true> = {};
                  if (selectedItemsCount !== items.length) {
                    items.forEach(item => {
                      selectedItems[item.id] = true;
                    });
                  }
                  console.log(selectedItems);
                  setSelectedItems({
                    itemsFromServer: selectedItemsState.itemsFromServer,
                    selectedItems,
                  });
                }}
              />
            </label>
          </TableHeaderCell>
          {selectedFields.includeLabel && <TableHeaderCell>Label</TableHeaderCell>}
          {shouldShowNonCellLink && <TableHeaderCell />}
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
          {items.map(item => {
            return (
              <tr key={item.id}>
                <TableBodyCell>
                  <label>
                    <CheckboxControl
                      checked={selectedItemsState.selectedItems[item.id] !== undefined}
                      onChange={() => {
                        setSelectedItems(state => {
                          const selectedItems = { ...state.selectedItems };
                          if (state.selectedItems[item.id] === undefined) {
                            selectedItems[item.id] = true;
                          } else {
                            delete selectedItems[item.id];
                          }
                          return {
                            itemsFromServer: state.itemsFromServer,
                            selectedItems,
                          };
                        });
                      }}
                    />
                  </label>
                </TableBodyCell>
                {selectedFields.includeLabel && (
                  <TableBodyCell>
                    <CellLink
                      href={`/${list.path}/[id]`}
                      as={`/${list.path}/${encodeURIComponent(item.id)}`}
                    >
                      {item._label_}
                    </CellLink>
                  </TableBodyCell>
                )}
                {shouldShowNonCellLink && (
                  <TableBodyCell>
                    <Link
                      css={{ textDecoration: 'none' }}
                      href={`/${list.path}/[id]`}
                      as={`/${list.path}/${encodeURIComponent(item.id)}`}
                    >
                      <LinkIcon aria-label="Go to item" />
                    </Link>
                  </TableBodyCell>
                )}
                {selectedFields.fields.map((path, i) => {
                  let { Cell } = list.fields[path].views;
                  return (
                    <TableBodyCell key={path}>
                      <Cell
                        item={item}
                        path={path}
                        linkTo={
                          i === 0 && !selectedFields.includeLabel && Cell.supportsLinkTo
                            ? {
                                href: `/${list.path}/[id]`,
                                as: `/${list.path}/${encodeURIComponent(item.id)}`,
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
