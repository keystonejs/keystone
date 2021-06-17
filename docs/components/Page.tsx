/** @jsx jsx  */
import { useRef, Fragment, ReactNode } from 'react';
import { jsx } from '@emotion/react';
import Head from 'next/head';

import { Emoji } from '../components/primitives/Emoji';
import { Announce } from '../components/Announce';
import { useMediaQuery } from '../lib/media';
import { TableOfContents } from './docs/TableOfContents';
import { DocsHeader } from './docs/DocsHeader';
import { DocsFooter } from './docs/DocsFooter';
import { Wrapper } from './primitives/Wrapper';
import { Sidebar } from './docs/Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';

function Announcement() {
  return (
    <Announce>
      Help us improve KeystoneJS! <Emoji symbol="✨" alt="Sparkles" />
      <a
        href="https://306ucv95ugh.typeform.com/to/gLuRTJIM"
        rel="noopener noreferrer"
        target="_blank"
        css={{
          margin: '0 0.25rem',
          textDecoration: 'underline',
          color: 'var(--brand-text)',
          ':hover': {
            color: 'var(--brand-text)',
          },
        }}
      >
        Click here to share your thoughts in a 5-minute survey
      </a>
      <Emoji symbol="🙏" alt="Hoping" />
    </Announce>
  );
}

export function DocsPage({
  headings = [],
  title,
  children,
}: {
  headings?: Heading[];
  children: ReactNode;
  title?: string;
}) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const metaTitle = title ? `${title} - Keystone Next Documentation` : `Keystone Next`;
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
        <DocsHeader />
        <Wrapper
          css={mq({
            display: ['block', null, 'grid'],
            gridTemplateColumns: '16.25rem minmax(0, auto) 16.25rem',
            gap: 'calc(var(--space-large) * 3)',
          })}
        >
          <Sidebar />

          <main
            ref={contentRef}
            className="prose"
            css={{
              marginTop: 'var(--space-xlarge)',
            }}
          >
            {children}
          </main>
          {!!headings.length && <TableOfContents container={contentRef} headings={headings} />}
        </Wrapper>
      </div>
      <DocsFooter />
    </Fragment>
  );
}

export function Page({ title, children }: { children: ReactNode; title?: string }) {
  const metaTitle = title ? `${title} - Keystone Next` : `Keystone Next`;

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
