import React from 'react';
import { Core } from '@keystone-ui/core';
import { AppProps } from 'next/app';
import { DocumentNode } from 'graphql';
import { AdminConfig, FieldViews } from '../../../../types';
import { ErrorBoundary } from '../../../../admin-ui/components';
import { KeystoneProvider } from '../../../../admin-ui/context';

type AppConfig = {
  adminConfig: AdminConfig;
  adminMetaHash: string;
  fieldViews: FieldViews;
  lazyMetadataQuery: DocumentNode;
  apiPath: string;
};

export const getApp =
  (props: AppConfig) =>
  ({ Component, pageProps }: AppProps) => {
    return (
      <Core>
        <KeystoneProvider {...props}>
          <ErrorBoundary>
            <Component {...pageProps} />
          </ErrorBoundary>
        </KeystoneProvider>
      </Core>
    );
  };
