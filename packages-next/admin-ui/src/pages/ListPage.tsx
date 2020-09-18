/* @jsx jsx */

import { useQuery, gql } from '../apollo';
import { jsx } from '@keystone-ui/core';
import Link from 'next/link';
import { useMemo } from 'react';

import { PageContainer } from '../components/PageContainer';
import { Navigation } from '../components/Navigation';
import { useList } from '../KeystoneContext';

type ListPageProps = {
  listKey: string;
};

export const ListPage = ({ listKey }: ListPageProps) => {
  const list = useList(listKey);

  let { data, error } = useQuery(
    useMemo(() => {
      let selectedFields = Object.keys(list.fields)
        .map(fieldPath => {
          return list.fields[fieldPath].controller.graphqlSelection;
        })
        .join('\n');
      return gql`
      query {
        items: ${list.gqlNames.listQueryName} {
          id
          _label_
          ${selectedFields}
        }
      }
    `;
    }, [list])
  );

  return (
    <PageContainer>
      <Navigation />
      <h2>List: {list.label}</h2>
      {error ? (
        'Error...'
      ) : data ? (
        <table>
          <thead>
            <tr>
              <th>Label</th>
              {Object.keys(list.fields).map(key => {
                return <th key={key}>{list.fields[key].label}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {data.items.map((item: any) => {
              return (
                <tr key={item.id}>
                  <td>
                    <Link href={`/${list.path}/[id]`} as={`/${list.path}/${item.id}`}>
                      <a>{item._label_}</a>
                    </Link>
                  </td>
                  {Object.keys(list.fields).map(fieldKey => {
                    let { Cell } = list.fields[fieldKey].views;
                    return (
                      <td key={fieldKey}>
                        <Cell item={item} path={fieldKey} />
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
