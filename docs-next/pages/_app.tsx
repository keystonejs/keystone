/** @jsx jsx */
import { jsx, Core } from '@keystone-ui/core';
import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { ToastProvider } from '@keystone-ui/toast';

import { handleRouteChange } from '../lib/analytics';

import 'tailwindcss/tailwind.css';

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
      <ToastProvider>
        <Component {...pageProps} />
      </ToastProvider>
    </Core>
  );
}
