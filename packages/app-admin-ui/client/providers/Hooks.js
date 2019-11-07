import React, { useContext, createContext } from 'react';
const HooksContext = createContext();

const defaultHooks = {
  // Intentionally empty for now
};

export const useHooks = () => useContext(HooksContext);
export const HooksProvider = ({ hooks, children }) => {
  return (
    <HooksContext.Provider value={{ ...defaultHooks, ...hooks }}>{children}</HooksContext.Provider>
  );
};
