import React, { useContext, createContext, useState } from 'react';
const ListContext = createContext();
export const useList = () => {
  const { list, isCreateItemModalOpen, openCreateItemModal, closeCreateItemModal } = useContext(
    ListContext
  );

  if (!list) {
    throw new Error('useList used before List is initialised');
  }
  return {
    list,
    isCreateItemModalOpen,
    openCreateItemModal,
    closeCreateItemModal,
  };
};

export const ListProvider = ({ list, children }) => {
  const [modals, setModalsOpen] = useState({ [list.key]: false });
  const isOpen = modals[list.key];
  const openCreateItemModal = () => {
    setModalsOpen({ ...modals, [list.key]: true });
  };
  const closeCreateItemModal = () => {
    setModalsOpen({ ...modals, [list.key]: false });
  };
  return (
    <ListContext.Provider
      value={{
        list,
        isCreateItemModalOpen: isOpen,
        openCreateItemModal,
        closeCreateItemModal,
      }}
    >
      {children}
    </ListContext.Provider>
  );
};
