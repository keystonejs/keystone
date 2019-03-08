import React from 'react';
import DataProvider from './DataProvider';
import ListDetails from './ListDetails';

export default function ListPage({ list }) {
  return (
    <DataProvider list={list}>
      {({ query, data, handlers, itemsErrors }) => (
        <ListDetails list={list} query={query} itemsErrors={itemsErrors} {...data} {...handlers} />
      )}
    </DataProvider>
  );
}
