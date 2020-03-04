import React, { useContext, createContext, useState } from 'react';
import { useQuery } from '@apollo/react-hooks';

import { useListUrlState } from '../pages/List/dataHooks';
import { deconstructErrorsToDataShape } from '../util';

const ListContext = createContext();

export const useList = () => {
  return useContext(ListContext);
};

export const ListProvider = ({ list, children }) => {
  // ==============================
  // Modal handlers
  // ==============================

  const [modals, setModalsOpen] = useState({ [list.key]: false });
  const isOpen = modals[list.key];

  const openCreateItemModal = () => {
    setModalsOpen({ ...modals, [list.key]: true });
  };

  const closeCreateItemModal = () => {
    setModalsOpen({ ...modals, [list.key]: false });
  };

  // ==============================
  // List items
  // ==============================

  const {
    urlState: { currentPage, fields, filters, pageSize, search, sortBy },
  } = useListUrlState(list);

  const query = useQuery(list.getListQuery(fields), {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
    variables: {
      where: formatFilter(filters),
      search,
      sortBy: formatSortBy(sortBy),
      first: pageSize,
      skip: (currentPage - 1) * pageSize,
    },
  });

  const { listQueryName, listQueryMetaName } = list.gqlNames;

  // Organize the data for easier use.
  // TODO: consider doing this at the query level with an alias
  const {
    error,
    data: { [listQueryName]: items, [listQueryMetaName]: { count } = {} } = {},
  } = query;

  return (
    <ListContext.Provider
      value={{
        list,
        listData: { items, itemCount: count },
        queryErrorsParsed: deconstructErrorsToDataShape(error)[listQueryName],
        query,
        isCreateItemModalOpen: isOpen,
        openCreateItemModal,
        closeCreateItemModal,
      }}
    >
      {children}
    </ListContext.Provider>
  );
};

// ==============================
// Formatting helpers
// ==============================

const formatFilter = (filters = []) => {
  return filters
    .map(({ field, ...config }) => field.getFilterGraphQL(config))
    .reduce((acc, value) => ({ ...acc, ...value }), {});
};

const formatSortBy = sortBy => {
  return sortBy ? `${sortBy.field.path}_${sortBy.direction}` : undefined;
};

// ==============================
// ListData Context
// ==============================

const ListDataContext = createContext();
export const useListData = () => useContext(ListDataContext);

export const ListDataProvider = ({ query, items, selectedItems, onSelectChange, children }) => (
  <ListDataContext.Provider
    value={{
      query,
      items,
      selectedItems,
      onSelectChange,
    }}
  >
    {children}
  </ListDataContext.Provider>
);
