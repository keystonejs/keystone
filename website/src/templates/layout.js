import React from 'react'; // eslint-disable-line no-unused-vars
import { jsx, Global } from '@emotion/core';

/** @jsx jsx */

import { colors } from '../styles';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';

const Layout = ({ children }) => (
  <>
    <Global
      styles={{
        body: {
          margin: 0,
          color: colors.B.text,
          fontFamily: 'system-ui, BlinkMacSystemFont, -apple-system, Segoe UI, Roboto,sans-serif',
          lineHeight: '1.5em',
        },

        a: {
          color: colors.B.base,
        },

        'pre[class*="language-"]': {
          padding: 16,
          width: '100%',
          boxSizing: 'border-box',
        },

        ':not(pre) > code[class*="language-"]': {
          background: 'white',
          padding: '2px 4px',
          fontSize: '0.9em',
          overflow: 'scroll',
        },
      }}
    />
    <Header />
    <div
      css={{
        display: 'flex',
        flexFlow: 'row wrap',
      }}
    >
      <aside
        css={{
          background: colors.B.A20,
          height: 'calc(100vh - 66px)',
          overflow: 'scroll',
          padding: 16,
          boxSizing: 'border-box',
          borderRight: `1px solid ${colors.B.A20}`,

          '@media all and (min-width: 600px)': {
            flex: '1 0 0',
          },

          '@media all and (min-width: 800px)': {
            order: 1,
          },
        }}
      >
        <Sidebar />
      </aside>
      <main
        css={{
          height: 'calc(100vh - 66px)',
          overflow: 'scroll',
          background: colors.B.A10,

          '@media all and (min-width: 800px)': {
            flex: '3 0px',
            order: 2,
          },
        }}
      >
        <div css={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>{children}</div>
        <Footer />
      </main>
    </div>
  </>
);

export default Layout;
