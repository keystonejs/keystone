import React, { ReactNode } from 'react';
import cx from 'classnames';
import Link from 'next/link';

import { Navigation } from './Navigation';

export const Page = ({ children, isProse }: { children: ReactNode; isProse?: boolean }) => {
  return (
    <div className="antialiased pb-24">
      <div className="pt-4 pb-4 border-b border-gray-200">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between sticky">
          <h2 className="flex items-center">
            <img
              alt="KeystoneJS Logo"
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIwIiBoZWlnaHQ9IjIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCB4MT0iMCUiIHkxPSIwJSIgeDI9IjUwJSIgeTI9IjcxLjkyMSUiIGlkPSJsb2dvLXN2Zy1ncmFkaWVudCI+CiAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiM1QUU4RkEiIG9mZnNldD0iMCUiLz4KICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iIzI2ODRGRiIgb2Zmc2V0PSIxMDAlIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cGF0aCBkPSJNMjkwLjEzNiA0N0g0MDcuNThjMTcuODMgMCAyNC4yOTcgMS44NTcgMzAuODE1IDUuMzQzIDYuNTE5IDMuNDg2IDExLjYzNCA4LjYwMiAxNS4xMiAxNS4xMiAzLjQ4NyA2LjUxOSA1LjM0MyAxMi45ODQgNS4zNDMgMzAuODE1djExNy40NDRjMCAxNy44My0xLjg1NiAyNC4yOTYtNS4zNDMgMzAuODE1LTMuNDg2IDYuNTE4LTguNjAxIDExLjYzNC0xNS4xMiAxNS4xMi02LjUxOCAzLjQ4Ni0xMi45ODQgNS4zNDMtMzAuODE1IDUuMzQzSDI5MC4xMzZjLTE3LjgzIDAtMjQuMjk2LTEuODU3LTMwLjgxNS01LjM0My02LjUxOC0zLjQ4Ni0xMS42MzQtOC42MDItMTUuMTItMTUuMTItMy40ODYtNi41MTktNS4zNDMtMTIuOTg0LTUuMzQzLTMwLjgxNVY5OC4yNzhjMC0xNy44MyAxLjg1Ny0yNC4yOTYgNS4zNDMtMzAuODE1IDMuNDg2LTYuNTE4IDguNjAyLTExLjYzNCAxNS4xMi0xNS4xMkMyNjUuODQgNDguODU3IDI3Mi4zMDUgNDcgMjkwLjEzNiA0N3ptMTEuNzYyIDU2Ljc2VjIxOGgyNS4xMnYtMzYuOGwxNC40LTE0LjU2IDM0LjQgNTEuMzZoMzEuNTJsLTQ4Ljk2LTY5LjEyIDQ0LjY0LTQ1LjEyaC0zMS4zNmwtNDQuNjQgNDcuMzZ2LTQ3LjM2aC0yNS4xMnoiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMzguODU4IC00NykiIGZpbGw9InVybCgjbG9nby1zdmctZ3JhZGllbnQpIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz4KPC9zdmc+Cg=="
              className="w-8 h-8 mr-2"
            />
            <Link href="/" passHref>
              <a className="bg-clip-text text-transparent bg-gradient-to-r from-lightblue-500 to-indigo-600 text-xl font-semibold">
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
              className="text-blue-400 hover:text-blue-500"
            >
              <span className="sr-only">KeystoneJS on Twitter</span>
              <svg width="20" height="20" fill="currentColor">
                <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="w-full max-w-6xl mx-auto flex mt-6">
        <aside className="flex-none w-52 mr-4 text-sm">
          <Navigation />
        </aside>
        <div className="min-w-0 w-full flex-auto max-h-full overflow-visible">
          <div className={cx({ prose: isProse }, 'w-full')}>{children}</div>
        </div>
      </div>
    </div>
  );
};

export const Markdown = ({ children }: { children: ReactNode }) => <Page isProse>{children}</Page>;
