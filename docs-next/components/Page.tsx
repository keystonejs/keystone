/** @jsx jsx  */
import { useRef, Fragment, ReactNode } from 'react';
import { MDXProvider } from '@mdx-js/react';
import { jsx } from '@keystone-ui/core';
import Head from 'next/head';

import { H1, H2, H3, H4, H5, H6 } from '../components/Heading';
import { getHeadings, Heading } from '../lib/getHeadings';
import { Code, InlineCode } from '../components/Code';
import { TableOfContents } from './TableOfContents';
// import { media } from '../lib/media';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

import cx from 'classnames';

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
        <main className="w-full max-w-5xl mx-auto block md:flex">
          <Sidebar />
          <div
            ref={contentRef}
            className="min-w-0 md:flex w-full flex-auto max-h-full overflow-visible px-2"
          >
            <main
              className={cx({ prose: isProse }, 'w-full max-w-none mt-6', {
                'md:w-3/4': headings.length,
              })}
            >
              {children}
            </main>
            {headings.length ? (
              <div className="md:w-1/4 hidden md:block">
                <TableOfContents container={contentRef} headings={headings} />
              </div>
            ) : null}
          </div>
        </main>
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

export const Markdown = ({ children }: { children: ReactNode }) => {
  const headings = getHeadings(children);
  return (
    <Page headings={headings} isProse title={headings[0].label}>
      <MDXProvider components={components}>{children}</MDXProvider>
    </Page>
  );
};
