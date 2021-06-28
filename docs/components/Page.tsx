/** @jsx jsx  */
import { useRef, Fragment, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { jsx } from '@emotion/react';
import Head from 'next/head';
import Link from 'next/link';

import { useMediaQuery } from '../lib/media';
import type { Heading } from '../lib/getHeadings';
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
      Keystone 6 is in Community Preview! What does that mean? see our{' '}
      <Link href="/updates/roadmap">Roadmap</Link>. For Keystone 5 docs, visit{' '}
      <a href="https://v5.keystonejs.com" rel="noopener noreferrer" target="_blank">
        v5.keystonejs.com
      </a>
    </Announce>
  );
}

export function DocsPage({
  children,
  headings = [],
  noProse,
  noRightNav,
  releases,
  title,
}: {
  children: ReactNode;
  headings?: Heading[];
  noProse?: boolean;
  noRightNav?: boolean;
  releases?: any;
  title?: string;
}) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const metaTitle = title ? `${title} - Keystone 6 Documentation` : `Keystone 6`;
  const mq = useMediaQuery();
  const { pathname } = useRouter();
  const isUpdatesPage = pathname.startsWith('/releases') || pathname.startsWith('/updates');

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
              ? '15rem minmax(0, auto)'
              : [
                  '15rem minmax(0, auto)',
                  null,
                  null,
                  '10rem minmax(0, auto) 10rem',
                  '15rem minmax(0, auto) 15rem',
                ],
            gap: ['var(--space-medium)', null, null, 'var(--space-large)', 'var(--space-xlarge)'],
          })}
        >
          <Sidebar releases={releases} isUpdatesPage={isUpdatesPage} />

          <main
            id="skip-link-content"
            tabIndex={0}
            ref={contentRef}
            className={noProse ? '' : 'prose'}
          >
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
        <Wrapper as="main" id="skip-link-content" tabIndex={0}>
          {children}
        </Wrapper>
      </div>
      <Footer />
    </Fragment>
  );
}
