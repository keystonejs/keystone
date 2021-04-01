/** @jsx jsx  */
import { Fragment, ReactNode } from 'react';
import Head from 'next/head';
import { useRef, useState } from 'react';
import { jsx } from '@keystone-ui/core';
import { MDXProvider } from '@mdx-js/react';
import cx from 'classnames';
import Link from 'next/link';
import { H1, H2, H3, H4, H5, H6 } from '../components/Heading';
import { Code, InlineCode } from '../components/Code';
import { getHeadings, Heading } from '../lib/getHeadings';
import { Navigation } from './Navigation';
import { TableOfContents } from './TableOfContents';

export const Page = ({
  headings = [],
  title,
  children,
  isProse,
}: {
  headings?: Heading[];
  children: ReactNode;
  title?: string;
  isProse?: boolean;
}) => {
  const [mobileNavCollapsed, setMobileNavCollapsed] = useState(true);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const metaTitle = title ? `${title} - Keystone Next Documentation` : `Keystone Next`;
  return (
    <Fragment>
      <Head>
        <meta key="og:site_name" property="og:site_name" content={metaTitle} />
        <title>{metaTitle}</title>
      </Head>
      <div className="pb-24">
        <header className="py-4 border-b border-gray-200">
          <div className="w-full max-w-5xl mx-auto flex items-center justify-between sticky px-2">
            <h2 className="flex items-center">
              <img
                alt="KeystoneJS Logo"
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIwIiBoZWlnaHQ9IjIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCB4MT0iMCUiIHkxPSIwJSIgeDI9IjUwJSIgeTI9IjcxLjkyMSUiIGlkPSJsb2dvLXN2Zy1ncmFkaWVudCI+CiAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiM1QUU4RkEiIG9mZnNldD0iMCUiLz4KICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iIzI2ODRGRiIgb2Zmc2V0PSIxMDAlIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cGF0aCBkPSJNMjkwLjEzNiA0N0g0MDcuNThjMTcuODMgMCAyNC4yOTcgMS44NTcgMzAuODE1IDUuMzQzIDYuNTE5IDMuNDg2IDExLjYzNCA4LjYwMiAxNS4xMiAxNS4xMiAzLjQ4NyA2LjUxOSA1LjM0MyAxMi45ODQgNS4zNDMgMzAuODE1djExNy40NDRjMCAxNy44My0xLjg1NiAyNC4yOTYtNS4zNDMgMzAuODE1LTMuNDg2IDYuNTE4LTguNjAxIDExLjYzNC0xNS4xMiAxNS4xMi02LjUxOCAzLjQ4Ni0xMi45ODQgNS4zNDMtMzAuODE1IDUuMzQzSDI5MC4xMzZjLTE3LjgzIDAtMjQuMjk2LTEuODU3LTMwLjgxNS01LjM0My02LjUxOC0zLjQ4Ni0xMS42MzQtOC42MDItMTUuMTItMTUuMTItMy40ODYtNi41MTktNS4zNDMtMTIuOTg0LTUuMzQzLTMwLjgxNVY5OC4yNzhjMC0xNy44MyAxLjg1Ny0yNC4yOTYgNS4zNDMtMzAuODE1IDMuNDg2LTYuNTE4IDguNjAyLTExLjYzNCAxNS4xMi0xNS4xMkMyNjUuODQgNDguODU3IDI3Mi4zMDUgNDcgMjkwLjEzNiA0N3ptMTEuNzYyIDU2Ljc2VjIxOGgyNS4xMnYtMzYuOGwxNC40LTE0LjU2IDM0LjQgNTEuMzZoMzEuNTJsLTQ4Ljk2LTY5LjEyIDQ0LjY0LTQ1LjEyaC0zMS4zNmwtNDQuNjQgNDcuMzZ2LTQ3LjM2aC0yNS4xMnoiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMzguODU4IC00NykiIGZpbGw9InVybCgjbG9nby1zdmctZ3JhZGllbnQpIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz4KPC9zdmc+Cg=="
                className="w-8 h-8 mr-2"
              />
              <Link href="/" passHref>
                <a className="bg-clip-text text-transparent hover:text-transparent bg-gradient-to-r from-lightblue-500 to-indigo-600 hover:from-lightblue-400 hover:to-indigo-700 text-xl font-semibold">
                  Keystone Next
                </a>
              </Link>
              <div className="ml-2 mt-1 px-1 rounded bg-gray-100 border border-gray-200 text-xs text-gray-500">
                preview
              </div>
            </h2>
            <div className="flex items-center">
              <a
                href="https://github.com/keystonejs/keystone"
                target="_blank"
                className="mr-4 text-gray-700 hover:text-gray-900"
              >
                <span className="sr-only">KeystoneJS on GitHub</span>
                <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
                  />
                </svg>
              </a>
              <a
                href="https://twitter.com/keystonejs"
                target="_blank"
                className="mr-4 text-blue-400 hover:text-blue-500"
              >
                <span className="sr-only">KeystoneJS on Twitter</span>
                <svg width="20" height="20" fill="currentColor">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="https://community.keystonejs.com/" target="_blank">
                <span className="sr-only">KeystoneJS on Slack</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 127 127"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2C6.7 93.2.8 87.3.8 80c0-7.3 5.9-13.2 13.2-13.2h13.2V80zm6.6 0c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V80z"
                    fill="#E01E5A"
                  />
                  <path
                    d="M47 27c-7.3 0-13.2-5.9-13.2-13.2C33.8 6.5 39.7.6 47 .6c7.3 0 13.2 5.9 13.2 13.2V27H47zm0 6.7c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H13.9C6.6 60.1.7 54.2.7 46.9c0-7.3 5.9-13.2 13.2-13.2H47z"
                    fill="#36C5F0"
                  />
                  <path
                    d="M99.9 46.9c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H99.9V46.9zm-6.6 0c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V13.8C66.9 6.5 72.8.6 80.1.6c7.3 0 13.2 5.9 13.2 13.2v33.1z"
                    fill="#2EB67D"
                  />
                  <path
                    d="M80.1 99.8c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V99.8h13.2zm0-6.6c-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h33.1c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H80.1z"
                    fill="#ECB22E"
                  />
                </svg>
              </a>
            </div>
          </div>
        </header>
        <div className="w-full max-w-5xl mx-auto block md:flex">
          <aside className="flex-none md:w-52 md:mr-4 md:text-sm">
            {mobileNavCollapsed ? (
              <a
                href="#"
                className="block text-gray-600 hover:text-gray-900 py-4 px-2 border-b border-grey-200 font-semibold md:hidden"
                onClick={event => {
                  event.preventDefault();
                  setMobileNavCollapsed(false);
                }}
              >
                Show Nav
              </a>
            ) : null}
            <div className={`px-2 mt-6 md:block ${mobileNavCollapsed ? 'hidden' : ''}`}>
              <Navigation />
            </div>
            {!mobileNavCollapsed ? (
              <a
                href="#"
                className="block text-gray-600 hover:text-gray-900 py-4 px-2 mt-4 border-b border-t border-grey-200 font-semibold md:hidden"
                onClick={event => {
                  event.preventDefault();
                  setMobileNavCollapsed(true);
                }}
              >
                Hide Nav
              </a>
            ) : null}
          </aside>
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
        </div>
      </div>
    </Fragment>
  );
};

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
