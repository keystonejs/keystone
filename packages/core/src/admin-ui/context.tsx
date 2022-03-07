import React, { ReactNode, createContext, useContext, useMemo } from 'react';
import { Center } from '@keystone-ui/core';
import { ToastProvider } from '@keystone-ui/toast';
import { LoadingDots } from '@keystone-ui/loading';
import { DrawerProvider } from '@keystone-ui/modals';
import { createUploadLink } from 'apollo-upload-client';
import type { AdminConfig, AdminMeta, FieldViews } from '../types';
import { useAdminMeta } from './utils/useAdminMeta';
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  ApolloError,
  DocumentNode,
  from,
} from './apollo';
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
    | { state: 'error'; error: ApolloError; refetch: () => void };
  fieldViews: FieldViews;
  authenticatedItem: AuthenticatedItem;
  visibleLists: VisibleLists;
  createViewFieldModes: CreateViewFieldModes;
  reinitContext: () => void;
  apiPath: string;
};

const KeystoneContext = createContext<KeystoneContextType | undefined>(undefined);

export type KeystoneProviderProps = {
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
  const reinitContext = () => {
    adminMeta?.refetch?.();
    refetch();
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
  const apolloClient = useMemo(() => {
    let link = createUploadLink({ uri: props.apiPath });
    if (props.adminConfig?.apolloLinks && props.adminConfig?.apolloLinks.length) {
      link = from([...props.adminConfig.apolloLinks, link]);
    }
    return new ApolloClient({
      cache: new InMemoryCache(),
      link,
    });
  }, [props.apiPath, props.adminConfig]);
  if (props.adminConfig?.providerLogic) {
    const result = props.adminConfig?.providerLogic(props);
    if (result) {
      return result;
    }
  }
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
    // If we get an "Access denied" error, it probably means the user doesn't have access to the
    // adminMeta but has navigated (probably client-side) to a page that requires it. We reload
    // the page so the server-side access control can run which should bounce them to the right
    // place (or display the no-access page)
    if (value.adminMeta.error.message === 'Access denied') {
      window.location.reload();
    }
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
