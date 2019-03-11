import React from 'react'; // eslint-disable-line no-unused-vars
import { jsx, Global } from '@emotion/core';

/** @jsx jsx */

import { colors } from '@arch-ui/theme';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';

const Layout = ({ children }) => (
  <>
    <Global
      styles={{
        body: {
          margin: 0,
          color: colors.B.D70,
          fontFamily: 'system-ui, BlinkMacSystemFont, -apple-system, Segoe UI, Roboto,sans-serif',
          lineHeight: '1.5em',
        },

        a: {
          color: colors.B.base,
        },

        img: {
          maxWidth: '100%',
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

    <div
      css={{
        display: 'grid',
        gridTemplateColumns: '350px auto',
        gridTemplateRows: '66px auto',
      }}
    >
      <div
        css={{
          gridRowStart: 1,
          gridRowEnd: 1,
          gridColumnStart: 1,
          gridColumnEnd: 3,
        }}
      >
        <Header />
      </div>

      <aside
        css={{
          background: colors.B.A5,
          height: 'calc(100vh - 66px)',
          overflow: 'scroll',
          padding: 16,
          boxSizing: 'border-box',
          borderRight: `1px solid ${colors.B.A20}`,
          gridRowStart: 2,
          gridRowEnd: 2,
          gridColumnStart: 1,
          gridColumnEnd: 1,
        }}
      >
        <Sidebar />
      </aside>
      <main
        css={{
          height: 'calc(100vh - 66px)',
          overflow: 'scroll',
          background: 'white',
          gridRowStart: 2,
          gridRowEnd: 2,
          gridColumnStart: 2,
          gridColumnEnd: 2,
        }}
      >
        <div>
          <div css={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>{children}</div>
        </div>
        <Footer />
      </main>
    </div>
  </>
);

export default Layout;
