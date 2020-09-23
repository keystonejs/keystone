/* @jsx jsx */

import { useQuery, gql } from '../apollo';
import { Button } from '@keystone-ui/button';
import { Box, H1, jsx, Stack, useTheme } from '@keystone-ui/core';
import { Fragment, ReactNode, useMemo } from 'react';
import { LinkIcon } from '@keystone-ui/icons/icons/LinkIcon';
import { PageContainer } from '../components/PageContainer';
import { useList } from '../KeystoneContext';
import { useRouter, Link } from '../router';
import { JSONValue } from '@keystone-spike/types';

type ListPageProps = {
  listKey: string;
};
type Filter = { field: string; type: string; value: JSONValue };

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

const TableHeaderCell = ({ children }: { children?: ReactNode }) => {
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
    >
      {children}
    </th>
  );
};

const TableBodyCell = ({ children }: { children: ReactNode }) => {
  const { colors, spacing, typography } = useTheme();
  return (
    <td
      css={{
        borderBottom: `1px solid ${colors.border}`,
        fontSize: typography.fontSize.medium,
        padding: spacing.small,
        textAlign: 'left',
      }}
    >
      {children}
    </td>
  );
};

export const ListPage = ({ listKey }: ListPageProps) => {
  const list = useList(listKey);

  const { query } = useRouter();
  const selectedFieldsFromUrl = typeof query.fields === 'string' ? query.fields : '';
  const possibleFilters = useMemo(() => {
    const possibleFilters: Record<string, { type: string; field: string }> = {};
    Object.entries(list.fields).forEach(([fieldPath, field]) => {
      if (field.controller.filter) {
        Object.keys(field.controller.filter.types).forEach(type => {
          possibleFilters[`!${fieldPath}_${type}`] = {
            type,
            field: fieldPath,
          };
        });
      }
    });
    console.log(possibleFilters);
    return possibleFilters;
  }, [list]);
  const filters = useMemo(() => {
    let filters: Filter[] = [];
    Object.keys(query).forEach(key => {
      const filter = possibleFilters[key];
      const val = query[key];
      if (filter && typeof val === 'string') {
        let value;
        try {
          value = JSON.parse(val);
        } catch (err) {}
        if (val !== undefined) {
          filters.push({
            ...filter,
            value,
          });
        }
      }
    });

    let where = {};

    filters.forEach(filter => {
      Object.assign(
        where,
        list.fields[filter.field].controller.filter!.graphql({
          type: filter.type,
          value: filter.value,
        })
      );
    });

    return { filters, where };
  }, [query, possibleFilters, list]);

  const selectedFields = useMemo(() => {
    if (!query.fields) {
      return {
        includeLabel: true,
        fields: list.initialColumns,
      };
    }
    let includeLabel = false;
    let fields = selectedFieldsFromUrl.split(',').filter(field => {
      if (field === '_label_') {
        includeLabel = true;
        return false;
      }
      return list.fields[field] !== undefined;
    });
    return {
      fields,
      includeLabel,
    };
  }, [list.initialColumns, selectedFieldsFromUrl]);

  let { data, error } = useQuery(
    useMemo(() => {
      let selectedGqlFields = selectedFields.fields
        .map(fieldPath => {
          return list.fields[fieldPath].controller.graphqlSelection;
        })
        .join('\n');
      return gql`
      query($where: ${list.gqlNames.whereInputName}) {
        items: ${list.gqlNames.listQueryName}(where: $where) {
          id
          ${selectedFields.includeLabel ? '_label_' : ''}
          ${selectedGqlFields}
        }
      }
    `;
    }, [list, selectedFields]),
    {
      variables: { where: filters.where },
    }
  );

  const shouldShowNonCellLink =
    !selectedFields.includeLabel &&
    !list.fields[selectedFields.fields[0]].views.Cell.supportsLinkTo;

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
        <TableContainer>
          <TableHeaderRow>
            {selectedFields.includeLabel && <TableHeaderCell>Label</TableHeaderCell>}
            {shouldShowNonCellLink && <TableHeaderCell />}
            {selectedFields.fields.map(path => {
              return <TableHeaderCell key={path}>{list.fields[path].label}</TableHeaderCell>;
            })}
          </TableHeaderRow>
          <tbody>
            {data.items.map((item: any) => {
              return (
                <tr key={item.id}>
                  {selectedFields.includeLabel && (
                    <TableBodyCell>
                      <Link
                        href={`/${list.path}/[id]`}
                        as={`/${list.path}/${encodeURIComponent(item.id)}`}
                      >
                        {item._label_}
                      </Link>
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
      ) : (
        'Loading...'
      )}
    </PageContainer>
  );
};
