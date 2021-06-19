/** @jsx jsx  */
import { useRef, Fragment, ReactNode } from 'react';
import { jsx } from '@emotion/react';
import Head from 'next/head';

import { useMediaQuery } from '../lib/media';
import { Announce } from '../components/Announce';
import { TableOfContents } from './docs/TableOfContents';
import { Wrapper } from './primitives/Wrapper';
import { Breadcrumbs } from './Breadcrumbs';
import { Sidebar } from './docs/Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';

function Announcement() {
  return (
    <Announce>
      This is the new version of Keystone! If you're looking for the Keystone 5 docs, check out{' '}
      <a href="https://v5.keystonejs.com" rel="noopener noreferrer" target="_blank">
        v5.keystonejs.com
      </a>
    </Announce>
  );
}

export function DocsPage({
  headings = [],
  title,
  children,
  noRightNav,
  noProse,
}: {
  headings?: Heading[];
  children: ReactNode;
  title?: string;
}) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const metaTitle = title ? `${title} - Keystone 6 Documentation` : `Keystone 6`;
  const mq = useMediaQuery();

  return (
    <Fragment>
      <Head>
        <meta key="og:site_name" property="og:site_name" content={metaTitle} />
        <title>{metaTitle}</title>
      </Head>
      <div
        css={{
          gridArea: 'main',
          position: 'relative',
          paddingBottom: 'var(--space-xxlarge)',
        }}
      >
        <Announcement />
        <Header />
        <Wrapper
          css={mq({
            display: ['block', null, 'grid'],
            gridTemplateColumns: noRightNav
              ? '16.25rem minmax(0, auto)'
              : '16.25rem minmax(0, auto) 16.25rem',
            gap: 'calc(var(--space-large) * 3)',
          })}
        >
          <Sidebar />

          <main ref={contentRef} className={noProse ? '' : 'prose'}>
            <Breadcrumbs />
            {children}
          </main>
          {!!headings.length && !noRightNav && (
            <TableOfContents container={contentRef} headings={headings} />
          )}
        </Wrapper>
      </div>
      <Footer />
    </Fragment>
  );
}

export function Page({ title, children }: { children: ReactNode; title?: string }) {
  const metaTitle = title ? `${title} - Keystone 6` : `Keystone 6`;

  return (
    <Fragment>
      <Head>
        <meta key="og:site_name" property="og:site_name" content={metaTitle} />
        <title>{metaTitle}</title>
      </Head>
      <div
        css={{
          gridArea: 'main',
          position: 'relative',
          paddingBottom: 'var(--space-xxlarge)',
        }}
      >
        <Announcement />
        <Header />
        <Wrapper as="main">{children}</Wrapper>
      </div>
      <Footer />
    </Fragment>
  );
}
