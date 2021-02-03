import React, { useEffect } from 'react';
import { Core } from '@keystone-ui/core';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';

import { handleRouteChange } from '../lib/analytics';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <Core>
      <Component {...pageProps} />
    </Core>
  );
}
