import React, { useContext, createContext, useState } from 'react';
import { useQuery } from '@apollo/client';

import { useListUrlState } from '../pages/List/dataHooks';
import { deconstructErrorsToDataShape, useListSelect } from '../util';

const ListContext = createContext();

export const useList = () => {
  return useContext(ListContext);
};

export const ListProvider = ({ children, list, skipQuery = false }) => {
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
    skip: skipQuery,
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
  const [selectedItems, setSelectedItems] = useListSelect(items);
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
        selectedItems,
        setSelectedItems,
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
