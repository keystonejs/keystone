import React, { useContext, createContext, useState, useMemo } from 'react';
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

  const { urlState } = useListUrlState(list);

  const LIST_QUERY = useMemo(() => {
    const { currentPage, fields, filters, pageSize, search, sortBy } = urlState;

    return list.getQuery({
      fields,
      filters,
      first: pageSize,
      sortBy,
      search,
      skip: (currentPage - 1) * pageSize,
    });
  }, [urlState]);

  const query = useQuery(LIST_QUERY, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
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
