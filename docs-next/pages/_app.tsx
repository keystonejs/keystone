import React from 'react';
import { Core } from '@keystone-ui/core';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Core>
      <Component {...pageProps} />
    </Core>
  );
}
