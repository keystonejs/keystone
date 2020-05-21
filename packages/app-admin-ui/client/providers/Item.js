import React, { useContext, createContext } from 'react';
const ItemContext = createContext();

export const useItem = () => useContext(ItemContext);
export const ItemProvider = ({ item, children }) => {
  return <ItemContext.Provider value={item}>{children}</ItemContext.Provider>;
};
