/** @jsx jsx */
import { ToastProvider } from 'react-toast-notifications';
import { jsx, Global, css } from '@emotion/react';
import { Fragment, useEffect } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
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
    <Fragment>
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
        body {
          font-size: var(--font-small);
        }
        html, body {
          background: var(--app-bg);
          color: var(--text);
          height: 100%;
          font-family: var(--font-body);
          padding: 0;
          margin: 0;
        },
        blockquote, dd, dl, figure, h1, h2, h3, h4, h5, h6, hr, p, pre {
          margin: 0;
        }
        a {
          text-decoration: none;
          color: var(--link);
        }
        .hint {
          border-radius: 4px;
          padding: 1rem 1rem 1rem 1.5rem;
          color: var(--text-heading);
        }
        .hint.neutral {
          background: var(--code-bg);
          border-left: 6px solid var(--text);
        }
        .hint.tip {
          background: var(--info-bg);
          border-left: 6px solid var(--info);
        }
        .hint.warn {
          background: var(--warning-bg);
          border-left: 6px solid var(--warning);
        }
        .hint.error {
          background: var(--danger-bg);
          border-left: 6px solid var(--danger);
        }
        *:focus-visible, input:focus-visible, button:focus-visible, [type="submit"]:focus-visible {
          outline: 1px dashed var(--focus);
          outline-offset: 3px;
        }
        input:focus-visible {
          outline-style: solid;
          outline-width: 3px;
          outline-offset: 0;
        }
        #__next {
          min-height: 100%;
          display: grid;
          grid-template-rows: auto 1fr;
          grid-template-areas: "header" "main" "footer";
          grid-template-columns: minmax(0, 1fr);
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
    </Fragment>
  );
}
