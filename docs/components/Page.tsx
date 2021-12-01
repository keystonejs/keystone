/** @jsxRuntime classic */
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
import { EditButton } from './primitives/EditButton';
// import { Emoji } from './primitives/Emoji';
import { Breadcrumbs } from './Breadcrumbs';
import { Sidebar } from './docs/Sidebar';
import { Stack } from './primitives/Stack';
import { Header } from './Header';
import { Footer } from './Footer';

function Announcement() {
  // special announcement
  // return (
  //   <Announce>
  //     <Emoji symbol="🎤" alt="Microphone" />{' '}
  //     <a
  //       href="https://306ucv95ugh.typeform.com/to/TbFERbep"
  //       rel="noopener noreferrer"
  //       target="_blank"
  //     >
  //       Join us
  //     </a>{' '}
  //     for our first <strong>Community Q&A</strong> next{' '}
  //     <strong>Tuesday Sep 21st @ 3–4pm AEST</strong> –{' '}
  //     <a
  //       href="https://306ucv95ugh.typeform.com/to/TbFERbep"
  //       rel="noopener noreferrer"
  //       target="_blank"
  //     >
  //       Register now
  //     </a>
  //     !
  //   </Announce>
  // );
  // standard announcement
  return (
    <Announce>
      <strong>
        Keystone 6 is now in <Link href="/updates/general-availability">General Availability</Link>!
      </strong>
    </Announce>
  );
}

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
  releases,
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
  releases?: any;
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
          paddingBottom: 'var(--space-xxlarge)',
        }}
      >
        <Announcement />
        <Header />
        <Wrapper
          css={mq({
            display: ['block', null, 'grid'],
            marginTop: '2.5rem',
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
            <Stack
              orientation="horizontal"
              block
              css={{ justifyContent: 'space-between', alignItems: 'baseline' }}
            >
              <Breadcrumbs />

              <EditButton pathName={pathname} isIndexPage={isIndexPage} editPath={editPath} />
            </Stack>
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
