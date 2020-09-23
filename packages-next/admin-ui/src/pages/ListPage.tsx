/* @jsx jsx */

import { useQuery, gql } from '../apollo';
import { jsx } from '@keystone-ui/core';
import { Fragment, useMemo } from 'react';
import { LinkIcon } from '@keystone-ui/icons/icons/LinkIcon';
import { PageContainer } from '../components/PageContainer';
import { useList } from '../KeystoneContext';
import { useRouter, Link } from '../router';
import { JSONValue } from '@keystone-spike/types';

type ListPageProps = {
  listKey: string;
};
type Filter = { field: string; type: string; value: JSONValue };

export const ListPage = ({ listKey }: ListPageProps) => {
  const list = useList(listKey);

  const { query } = useRouter();
  const selectedFieldsFromUrl = typeof query.fields === 'string' ? query.fields : '';
  const filters = useMemo(() => {
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
  }, [query, list]);

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
      <h2>List: {list.label}</h2>
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
        'Error...'
      ) : data ? (
        <table>
          <thead>
            <tr>
              {selectedFields.includeLabel && <th>Label</th>}
              {shouldShowNonCellLink && <th />}
              {selectedFields.fields.map(key => {
                return <th key={key}>{list.fields[key].label}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {data.items.map((item: any) => {
              return (
                <tr key={item.id}>
                  {selectedFields.includeLabel && (
                    <td>
                      <Link
                        href={`/${list.path}/[id]`}
                        as={`/${list.path}/${encodeURIComponent(item.id)}`}
                      >
                        {item._label_}
                      </Link>
                    </td>
                  )}
                  {shouldShowNonCellLink && (
                    <td>
                      <Link
                        css={{ textDecoration: 'none' }}
                        href={`/${list.path}/[id]`}
                        as={`/${list.path}/${encodeURIComponent(item.id)}`}
                      >
                        <LinkIcon aria-label="Go to item" />
                      </Link>
                    </td>
                  )}
                  {selectedFields.fields.map((fieldKey, i) => {
                    let { Cell } = list.fields[fieldKey].views;
                    return (
                      <td key={fieldKey}>
                        <Cell
                          item={item}
                          path={fieldKey}
                          linkTo={
                            i === 0 && !selectedFields.includeLabel && Cell.supportsLinkTo
                              ? {
                                  href: `/${list.path}/[id]`,
                                  as: `/${list.path}/${encodeURIComponent(item.id)}`,
                                }
                              : undefined
                          }
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        'Loading...'
      )}
    </PageContainer>
  );
};
