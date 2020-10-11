import React from 'react';
import { Core } from '@keystone-ui/core';
import { DrawerProvider } from '@keystone-ui/modals';
import { ToastProvider } from '@keystone-ui/toast';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Core>
      <DrawerProvider>
        <ToastProvider>
          <Component {...pageProps} />
        </ToastProvider>
      </DrawerProvider>
    </Core>
  );
}
