/** @jsx jsx  */
import { useRef, Fragment, ReactNode } from 'react';
import { MDXProvider } from '@mdx-js/react';
import { jsx } from '@keystone-ui/core';
import Head from 'next/head';

import { H1, H2, H3, H4, H5, H6 } from '../components/Heading';
import { getHeadings, Heading } from '../lib/getHeadings';
import { Code, InlineCode } from '../components/Code';
import { useMediaQuery } from '../lib/media';
import { TableOfContents } from './TableOfContents';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function Page({
  headings = [],
  title,
  children,
  isProse,
}: {
  headings?: Heading[];
  children: ReactNode;
  title?: string;
  isProse?: boolean;
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
          paddingBottom: 'var(--space-xxlarge)',
        }}
      >
        <Header />
        <div
          css={mq({
            display: ['block', null, 'grid'],
            gridTemplateColumns: '9rem minmax(0, auto) 12rem',
            maxWidth: '66rem',
            margin: '0 auto',
            gap: '3rem',
            padding: ['0', null, '0 1rem'],
          })}
        >
          <Sidebar />

          <main
            ref={contentRef}
            className={isProse ? 'prose' : ''}
            css={mq({
              marginTop: '1.5rem',
              padding: ['0 1rem', null, '0'],
            })}
          >
            {children}
          </main>
          {!!headings.length && <TableOfContents container={contentRef} headings={headings} />}
        </div>
      </div>
    </Fragment>
  );
}

export const components = {
  code: Code,
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  inlineCode: InlineCode,
};

export function Markdown({ children }: { children: ReactNode }) {
  const headings = getHeadings(children);

  return (
    <Page headings={headings} isProse title={headings[0].label}>
      <MDXProvider components={components}>{children}</MDXProvider>
    </Page>
  );
}
