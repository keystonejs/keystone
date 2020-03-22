/** @jsx jsx */
import { jsx } from '@emotion/core';
import { createContext, useContext } from 'react';

const ContentFieldContext = createContext();

export const ContentFieldProvider = ({ children, value }) => {
  return <ContentFieldContext.Provider value={value}>{children}</ContentFieldContext.Provider>;
};

/**
 * React hook to access the Content field's data.
 * @param {string} blockType - Optional block type name.
 * @returns If a valid blockType is provided, that block's data will be returned. If not, all data is returned.
 */
export const useContentField = blockType => {
  const value = useContext(ContentFieldContext);

  if (blockType) {
    const {
      blocks: { [blockType]: requestedBlock },
    } = value;

    if (requestedBlock) {
      return requestedBlock;
    }
  }

  return value;
};
