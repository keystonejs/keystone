import React, { useContext, createContext, useState, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/react-hooks';

import { decodeSearch } from '../pages/List/url-state';

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
  // URL state
  // ==============================

  const urlState = useRef({});
  const location = useLocation();
  const decodeConfig = { list };

  // ==============================
  // List items
  // ==============================

  const LIST_QUERY = useMemo(() => {
    urlState.current = decodeSearch(location.search, decodeConfig);
    const { currentPage, fields, filters, pageSize, search, sortBy } = urlState.current;

    return list.getQuery({
      fields,
      filters,
      first: pageSize,
      orderBy: sortBy ? `${sortBy.field.path}_${sortBy.direction}` : null,
      search,
      skip: (currentPage - 1) * pageSize,
    });
  }, [location]);

  const query = useQuery(LIST_QUERY, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  const { listQueryName, listQueryMetaName } = list.gqlNames;

  // Organize the data for easier use.
  // TODO: consider doing this at the query level with an alias
  // TODO: should we use deconstructErrorsToDataShape on the error?
  // Need to check all uses of this data before deciding.
  const {
    data: { error, [listQueryName]: items, [listQueryMetaName]: { count } = {} } = {},
  } = query;

  return (
    <ListContext.Provider
      value={{
        list,
        listData: { items, itemCount: count, queryErrors: error },
        query,
        urlState: urlState.current,
        decodeConfig,
        isCreateItemModalOpen: isOpen,
        openCreateItemModal,
        closeCreateItemModal,
      }}
    >
      {children}
    </ListContext.Provider>
  );
};
