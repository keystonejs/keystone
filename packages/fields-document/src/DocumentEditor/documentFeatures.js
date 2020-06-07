import { createContext, useContext } from 'react';

export const DocumentFeaturesContext = createContext({});

export const useDocumentFeatures = () => {
  return useContext(DocumentFeaturesContext);
};
