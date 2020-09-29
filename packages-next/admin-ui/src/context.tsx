import React, { ReactNode, createContext, useContext, useMemo } from 'react';
import { ApolloProvider, ApolloClient, InMemoryCache, ApolloError, DocumentNode } from './apollo';
import type { AdminConfig, AdminMeta, FieldViews } from '@keystone-spike/types';
import { Center } from '@keystone-ui/core';
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
  reinitContext: () => void;
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

  const adminMeta = useAdminMeta(apolloClient, adminMetaHash, fieldViews);
  const authenticatedItem = useAuthenticatedItem(authenticatedItemQuery, apolloClient);

  const reinitContext = () => {
    adminMeta?.refetch?.();
    authenticatedItem.refetch();
  };

  if (adminMeta.state === 'loading') {
    return (
      <Center fillView>
        <LoadingDots label="Loading Admin Metadata" size="large" />
      </Center>
    );
  }
  return (
    <KeystoneContext.Provider
      value={{
        adminConfig,
        adminMeta,
        fieldViews,
        authenticatedItem,
        reinitContext,
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

export const useReinitContext = () => {
  const value = useContext(KeystoneContext);
  if (!value) {
    throw new Error('useReinitContext must be called inside a KeystoneProvider component');
  }
  return value.reinitContext;
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
