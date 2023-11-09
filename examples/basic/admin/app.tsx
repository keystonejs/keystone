import React from 'react';
import { Core, ThemeProvider } from '@keystone-ui/core';
import { AppProps } from 'next/app';
import { DocumentNode } from 'graphql';
import { AdminConfig, FieldViews } from '@keystone-6/core/types';
import { ErrorBoundary } from '@keystone-6/core/admin-ui/components';
import { KeystoneProvider } from '@keystone-6/core/admin-ui/context';
import { theme } from './themes/default';

type AppConfig = {
  adminConfig: AdminConfig;
  adminMetaHash: string;
  fieldViews: FieldViews;
  lazyMetadataQuery: DocumentNode;
  apiPath: string;
};

export const getApp =
  (props: AppConfig) => ({ Component, pageProps }: AppProps) => {
    return (
      <Core>
        <KeystoneProvider {...props}>
          <ThemeProvider theme={theme}>
            <ErrorBoundary>
              <Component {...pageProps} />
            </ErrorBoundary>
          </ThemeProvider>
        </KeystoneProvider>
      </Core>
    );
  };
