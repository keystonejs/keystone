import React from 'react';
import DataProvider from './DataProvider';
import ListDetails from './ListDetails';

export default function ListPage({ adminPath, list }) {
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
