/** @jsxRuntime classic */
/** @jsx jsx  */
import { useRef, Fragment, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { jsx } from '@emotion/react';
import Head from 'next/head';

import { useMediaQuery } from '../lib/media';
import type { Heading } from '../lib/getHeadings';
import { TableOfContents } from './docs/TableOfContents';
import { Wrapper } from './primitives/Wrapper';
import { EditButton } from './primitives/EditButton';
import { Breadcrumbs } from './Breadcrumbs';
import { Sidebar } from './docs/Sidebar';
import { Stack } from './primitives/Stack';
import { Header } from './Header';
import { Footer, DocsFooter } from './Footer';

function OpenGraph({
  title,
  description,
  ogImage,
}: {
  title: string;
  description: string;
  ogImage?: string;
}) {
  const siteUrl = process.env.siteUrl;
  if (!ogImage) {
    ogImage = `${siteUrl}/og-image-landscape.png`;
  }
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta key="og:site_name" property="og:site_name" content={title} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${ogImage}`} />
      <meta property="og:image:width" content="761" />
      <meta property="og:image:height" content="410" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${ogImage}`} />
    </Head>
  );
}

export function DocsPage({
  children,
  headings = [],
  noProse,
  noRightNav,
  title,
  description,
  ogImage,
  isIndexPage,
  editPath,
}: {
  children: ReactNode;
  headings?: Heading[];
  noProse?: boolean;
  noRightNav?: boolean;
  title: string;
  description: string;
  ogImage?: string;
  isIndexPage?: boolean;
  editPath?: string;
}) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const mq = useMediaQuery();
  const { pathname } = useRouter();
  const isUpdatesPage = pathname.startsWith('/releases') || pathname.startsWith('/updates');

  const metaTitle = title ? `${title} - Keystone 6 Documentation` : `Keystone 6 Documentation`;

  return (
    <Fragment>
      <OpenGraph title={metaTitle} description={description} ogImage={ogImage} />
      <div
        css={{
          gridArea: 'main',
          position: 'relative',
          display: 'grid',
          gridTemplateRows: '4.5rem calc(100vh - 4.5rem)',
        }}
      >
        <Header />
        <Wrapper
          css={mq({
            borderTop: '1px solid var(--border)',
            overflowY: 'auto',
            display: ['block', null, 'grid'],
            marginTop: '0rem',
            gridTemplateColumns: '15rem minmax(0, 1fr)',
            gridTemplateRows: '1fr auto',
            gap: ['var(--space-medium)', null, null, 'var(--space-large)', 'var(--space-xlarge)'],
          })}
        >
          <Sidebar isUpdatesPage={isUpdatesPage} />
          <div
            id="content-and-toc"
            css={mq({
              gridColumn: '2 / 3',
              gridRow: '1 / 2',
              display: ['block', null, 'grid'],
              gridTemplateColumns: noRightNav
                ? 'minmax(0, 1fr)'
                : ['minmax(0, 1fr)', null, null, 'minmax(0, 1fr) 10rem', 'minmax(0, 1fr) 15rem'],
              gap: ['var(--space-medium)', null, null, 'var(--space-large)', 'var(--space-xlarge)'],
            })}
          >
            <main
              id="skip-link-content"
              tabIndex={0}
              ref={contentRef}
              className={noProse ? '' : 'prose'}
              css={{
                paddingTop: '2rem',
              }}
            >
              <Stack
                orientation="horizontal"
                block
                css={{ justifyContent: 'space-between', alignItems: 'baseline' }}
              >
                <Breadcrumbs />

                <EditButton pathName={pathname} isIndexPage={isIndexPage} editPath={editPath} />
              </Stack>
              <div id="content" css={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)' }}>
                {children}
              </div>
            </main>
            {!!headings.length && !noRightNav && (
              <TableOfContents container={contentRef} headings={headings} />
            )}
          </div>
          <DocsFooter />
        </Wrapper>
      </div>
    </Fragment>
  );
}

export function BlogPage({
  children,
  headings = [],
  noProse,
  noRightNav,
  title,
  description,
  ogImage,
  isIndexPage,
  editPath,
}: {
  children: ReactNode;
  headings?: Heading[];
  noProse?: boolean;
  noRightNav?: boolean;
  title: string;
  description: string;
  ogImage?: string;
  isIndexPage?: boolean;
  editPath?: string;
}) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const mq = useMediaQuery();
  const { pathname } = useRouter();

  const metaTitle = title ? `${title} | The Keystone Blog` : `The Keystone Blog`;

  return (
    <Fragment>
      <OpenGraph title={metaTitle} description={description} ogImage={ogImage} />
      <div
        css={{
          gridArea: 'main',
          position: 'relative',
          display: 'grid',
          gridTemplateRows: '4.5rem calc(100vh - 4.5rem)',
        }}
      >
        <Header />
        <Wrapper
          css={mq({
            borderTop: '1px solid var(--border)',
            overflowY: 'auto',
            display: ['block', null, 'grid'],
            marginTop: '0rem',
            gridTemplateColumns: '15rem minmax(0, 1fr)',
            gridTemplateRows: '1fr auto',
            gap: ['var(--space-medium)', null, null, 'var(--space-large)', 'var(--space-xlarge)'],
          })}
        >
          <span />
          <div
            id="content-and-toc"
            css={mq({
              gridColumn: '2 / 3',
              gridRow: '1 / 2',
              display: ['block', null, 'grid'],
              gridTemplateColumns: noRightNav
                ? 'minmax(0, 1fr)'
                : ['minmax(0, 1fr)', null, null, 'minmax(0, 1fr) 10rem', 'minmax(0, 1fr) 15rem'],
              gap: ['var(--space-medium)', null, null, 'var(--space-large)', 'var(--space-xlarge)'],
            })}
          >
            <main
              id="skip-link-content"
              tabIndex={0}
              ref={contentRef}
              className={noProse ? '' : 'prose'}
              css={{
                paddingTop: '2rem',
              }}
            >
              <Stack
                orientation="horizontal"
                block
                css={{ justifyContent: 'space-between', alignItems: 'baseline' }}
              >
                <Breadcrumbs />

                <EditButton pathName={pathname} isIndexPage={isIndexPage} editPath={editPath} />
              </Stack>
              <div id="content" css={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)' }}>
                {children}
              </div>
            </main>
            {!!headings.length && !noRightNav && (
              <TableOfContents container={contentRef} headings={headings} />
            )}
          </div>
          <DocsFooter />
        </Wrapper>
      </div>
    </Fragment>
  );
}

export function Page({
  children,
  title,
  description,
  ogImage,
}: {
  children: ReactNode;
  title: string;
  description: string;
  ogImage?: string;
}) {
  const metaTitle = title ? `${title} - Keystone 6` : `Keystone 6`;
  return (
    <Fragment>
      <OpenGraph title={metaTitle} description={description} ogImage={ogImage} />
      <div
        css={{
          gridArea: 'main',
          position: 'relative',
          paddingBottom: 'var(--space-xxlarge)',
        }}
      >
        <Header />
        <Wrapper as="main" id="skip-link-content" tabIndex={0}>
          {children}
        </Wrapper>
      </div>
      <Footer />
    </Fragment>
  );
}
