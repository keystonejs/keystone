import React from 'react';
/* @jsx jsx */
import { jsx, Global, css } from '@emotion/core';

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
          color: colors.B.D55,
          background: colors.B.bg,
          fontFamily: 'system-ui, BlinkMacSystemFont, -apple-system, Segoe UI, Roboto,sans-serif',
        },

        'pre[class*="language-"]': {
          background: 'white',
          fontSize: '0.8em',
          width: '100%',
          maxWidth: 600,
        },
      }}
    />
    <Header />
    <div
      css={{
        display: 'flex',
        flexFlow: 'row wrap',
        paddingTop: 60,

        '> *': {
          padding: 10,
        },
      }}
    >
      <aside
        css={css`
          background: ${colors.B.A10};
          height: calc(100vh - 50px);
          overflow: scroll;

          @media all and (min-width: 600px) {
            flex: 1 0 0;
          }

          @media all and (min-width: 800px) {
            order: 1;
          }
        `}
      >
        <Sidebar />
      </aside>
      <main
        css={css`
          padding: 16px;
          height: calc(100vh - 60px);
          overflow: scroll;

          @media all and (min-width: 800px) {
            flex: 3 0px;
            order: 2;
          }
        `}
      >
        <div>{children}</div>
      </main>
    </div>
  </>
);

export default Layout;
