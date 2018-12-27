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
          color: colors.B.text,
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
      }}
    >
      <aside
        css={css`
          background: ${colors.B.A25};
          height: calc(100vh - 60px);
          overflow: scroll;
          padding: 16px;
          box-sizing: border-box;

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
          height: calc(100vh - 64px);
          overflow: scroll;
          background: ${colors.B.A10};

          @media all and (min-width: 800px) {
            flex: 3 0px;
            order: 2;
          }
        `}
      >
        <div css={{ padding: 24 }}>{children}</div>
        <Footer />
      </main>
    </div>
  </>
);

export default Layout;
