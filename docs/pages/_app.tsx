/** @jsx jsx */
import { jsx, Core, Global, css } from '@keystone-ui/core';
import { ToastProvider } from '@keystone-ui/toast';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Head from 'next/head';

import { handleRouteChange } from '../lib/analytics';
import { proseStyles } from '../lib/prose-lite';
import { Theme } from '../components/Theme';

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
      <Global
        styles={css`
        .prose {
          ${proseStyles}
        }
      `}
      />
      <Global
        styles={css`
        *, ::before, ::after {
          box-sizing: border-box;
        }
        blockquote, dd, dl, figure, h1, h2, h3, h4, h5, h6, hr, p, pre {
          margin: 0;
        }
        a {
          text-decoration: none;
        }
        .hint {
          border-radius: 0.375rem;
          padding: 1rem;
        }
        .hint.tip {
          background: var(--blue-50);
          border: 1px solid var(--blue-100);
        }
        .hint.warn {
          background: var(--yellow-50);
          border: 1px solid var(--yellow-100);
        }
        .hint.error {
          background: var(--red-50);
          border: 1px solid var(--red-100);
        }
      `}
      />
      <Theme />
      <Head>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,shrink-to-fit=no,viewport-fit=cover"
        />
      </Head>
      <ToastProvider>
        <Component {...pageProps} />
      </ToastProvider>
    </Core>
  );
}
