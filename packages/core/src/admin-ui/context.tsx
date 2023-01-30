import React, { ReactNode, createContext, useContext, useMemo } from 'react';
import { Center } from '@keystone-ui/core';
import { ToastProvider } from '@keystone-ui/toast';
import { LoadingDots } from '@keystone-ui/loading';
import { DrawerProvider } from '@keystone-ui/modals';
import { createUploadLink } from 'apollo-upload-client';
import type { AdminConfig, AdminMeta, FieldViews } from '../types';
import { useAdminMeta } from './utils/useAdminMeta';
import { ApolloProvider, ApolloClient, InMemoryCache, ApolloError, DocumentNode } from './apollo';
import {
  AuthenticatedItem,
  VisibleLists,
  useLazyMetadata,
  CreateViewFieldModes,
} from './utils/useLazyMetadata';

type KeystoneContextType = {
  adminConfig: AdminConfig;
  adminMeta:
    | { state: 'loaded'; value: AdminMeta }
    | { state: 'error'; error: ApolloError; refetch: () => Promise<void> };
  fieldViews: FieldViews;
  authenticatedItem: AuthenticatedItem;
  visibleLists: VisibleLists;
  createViewFieldModes: CreateViewFieldModes;
  reinitContext: () => Promise<void>;
  apiPath: string;
};

const KeystoneContext = createContext<KeystoneContextType | undefined>(undefined);

type KeystoneProviderProps = {
  children: ReactNode;
  adminConfig: AdminConfig;
  adminMetaHash: string;
  fieldViews: FieldViews;
  lazyMetadataQuery: DocumentNode;
  apiPath: string;
};

function InternalKeystoneProvider({
  adminConfig,
  fieldViews,
  adminMetaHash,
  children,
  lazyMetadataQuery,
  apiPath,
}: KeystoneProviderProps) {
  const adminMeta = useAdminMeta(adminMetaHash, fieldViews);
  const { authenticatedItem, visibleLists, createViewFieldModes, refetch } =
    useLazyMetadata(lazyMetadataQuery);
  const reinitContext = async () => {
    await adminMeta?.refetch?.();
    await refetch();
  };

  if (adminMeta.state === 'loading') {
    return (
      <Center fillView>
        <LoadingDots label="Loading Admin Metadata" size="large" />
      </Center>
    );
  }
  return (
    <ToastProvider>
      <DrawerProvider>
        <KeystoneContext.Provider
          value={{
            adminConfig,
            adminMeta,
            fieldViews,
            authenticatedItem,
            reinitContext,
            visibleLists,
            createViewFieldModes,
            apiPath,
          }}
        >
          {children}
        </KeystoneContext.Provider>
      </DrawerProvider>
    </ToastProvider>
  );
}

export const KeystoneProvider = (props: KeystoneProviderProps) => {
  const apolloClient = useMemo(
    () =>
      new ApolloClient({
        cache: new InMemoryCache(),
        link: createUploadLink({
          uri: props.apiPath,
          headers: { 'Apollo-Require-Preflight': 'true' },
        }),
      }),
    [props.apiPath]
  );

  return (
    <ApolloProvider client={apolloClient}>
      <InternalKeystoneProvider {...props} />
    </ApolloProvider>
  );
};

export const useKeystone = (): {
  adminConfig: AdminConfig;
  adminMeta: AdminMeta;
  authenticatedItem: AuthenticatedItem;
  visibleLists: VisibleLists;
  createViewFieldModes: CreateViewFieldModes;
  apiPath: string;
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
    visibleLists: value.visibleLists,
    createViewFieldModes: value.createViewFieldModes,
    apiPath: value.apiPath,
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
