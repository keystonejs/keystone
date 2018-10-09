// @flow
import React from 'react';
import DataProvider from './DataProvider';
import ListDetails from './ListDetails';
import List from '../../classes/List';

type Props = {
  adminPath: string,
  list: List,
};

export default function ListPage({ adminPath, list }: Props) {
  return (
    <DataProvider adminPath={adminPath} list={list}>
      {({ query, data, handlers, itemsErrors }) => (
        <ListDetails
          adminPath={adminPath}
          list={list}
          query={query}
          itemsErrors={itemsErrors}
          {...data}
          {...handlers}
        />
      )}
    </DataProvider>
  );
}
