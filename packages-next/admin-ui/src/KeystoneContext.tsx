import React, { ReactNode, createContext, useContext, useMemo } from 'react';
import { ApolloProvider, ApolloClient, InMemoryCache, ApolloError, DocumentNode } from './apollo';
import type { AdminConfig, AdminMeta, FieldViews } from '@keystone-spike/types';
import { LoadingDots } from '@keystone-ui/loading';
import { useAdminMeta } from './utils/useAdminMeta';
import { AuthenticatedItem, useAuthenticatedItem } from './utils/useAuthenticatedItem';

type KeystoneContextType = {
  adminConfig: AdminConfig;
  adminMeta:
    | { state: 'loaded'; value: AdminMeta }
    | { state: 'error'; error: ApolloError; refetch: () => void };
  fieldViews: FieldViews;
  authenticatedItem: AuthenticatedItem;
};

const KeystoneContext = createContext<KeystoneContextType | undefined>(undefined);

type KeystoneProviderProps = {
  children: ReactNode;
  adminConfig: AdminConfig;
  adminMetaHash: string;
  fieldViews: FieldViews;
  authenticatedItemQuery: DocumentNode;
};

export const KeystoneProvider = ({
  adminConfig,
  fieldViews,
  adminMetaHash,
  children,
  authenticatedItemQuery,
}: KeystoneProviderProps) => {
  const apolloClient = useMemo(
    () =>
      new ApolloClient({
        cache: new InMemoryCache(),
        uri: '/api/graphql',
      }),
    []
  );

  let adminMeta = useAdminMeta(apolloClient, adminMetaHash, fieldViews);
  const authenticatedItem = useAuthenticatedItem(authenticatedItemQuery, apolloClient);

  if (adminMeta.state === 'loading') {
    return <LoadingDots label="Loading Admin Metadata" size="large" />;
  }
  return (
    <KeystoneContext.Provider
      value={{
        adminConfig,
        adminMeta,
        fieldViews,
        authenticatedItem,
      }}
    >
      <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
    </KeystoneContext.Provider>
  );
};

export const useKeystone = (): {
  adminConfig: AdminConfig;
  adminMeta: AdminMeta;
  authenticatedItem: AuthenticatedItem;
} => {
  const value = useContext(KeystoneContext);
  if (!value) {
    throw new Error('useKeystone must be called inside a KeystoneProvider component');
  }
  if (value.adminMeta.state === 'error') {
    throw new Error('An error occurred when loading Admin Metadata');
  }
  return {
    adminConfig: value.adminConfig,
    adminMeta: value.adminMeta.value,
    authenticatedItem: value.authenticatedItem,
  };
};

export const useRawKeystone = () => {
  const value = useContext(KeystoneContext);
  if (!value) {
    throw new Error('useRawKeystone must be called inside a KeystoneProvider component');
  }
  return value;
};

export const useList = (key: string) => {
  const {
    adminMeta: { lists },
  } = useKeystone();
  if (lists[key]) {
    return lists[key];
  } else {
    throw new Error(`Invalid list key provided to useList: ${key}`);
  }
};
