/* @jsx jsx */

import { useQuery, gql } from '../apollo';
import { jsx } from '@keystone-ui/core';
import { Fragment, useMemo } from 'react';
import { LinkIcon } from '@keystone-ui/icons/icons/LinkIcon';
import { PageContainer } from '../components/PageContainer';
import { useList } from '../KeystoneContext';
import { useRouter, Link } from '../router';

type ListPageProps = {
  listKey: string;
};

export const ListPage = ({ listKey }: ListPageProps) => {
  const list = useList(listKey);

  const { query } = useRouter();
  const selectedFieldsFromUrl = query.fields || '';
  const selectedFields = useMemo(() => {
    if (!query.fields) {
      return {
        includeLabel: true,
        fields: list.initialColumns,
      };
    }
    let includeLabel = false;
    let fields = (selectedFieldsFromUrl as string).split(',').filter(field => {
      if (field === '_label_') {
        includeLabel = true;
        return false;
      }
      return true;
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
      query {
        items: ${list.gqlNames.listQueryName} {
          id
          ${selectedFields.includeLabel ? '_label_' : ''}
          ${selectedGqlFields}
        }
      }
    `;
    }, [list, selectedFields])
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
                      <Link href={`/${list.path}/[id]`} as={`/${list.path}/${item.id}`}>
                        {item._label_}
                      </Link>
                    </td>
                  )}
                  {shouldShowNonCellLink && (
                    <td>
                      <Link
                        css={{ textDecoration: 'none' }}
                        href={`/${list.path}/[id]`}
                        as={`/${list.path}/${item.id}`}
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
                                  as: `/${list.path}/${item.id}`,
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
