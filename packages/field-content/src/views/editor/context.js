/** @jsx jsx */
import { jsx } from '@emotion/core';
import { createContext, useContext } from 'react';

const ContentFieldContext = createContext();

export const ContentFieldProvider = ({ children, value }) => {
  return <ContentFieldContext.Provider value={value}>{children}</ContentFieldContext.Provider>;
};

export const useContentField = () => {
  return useContext(ContentFieldContext);
};
