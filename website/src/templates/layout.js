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
        '*': { boxSizing: 'border-box' },
      }}
    />
    <Header />
    <div css={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
      <Sidebar />
      <main id="primary" css={{ padding: '32px' }}>
        {children}
      </main>
    </div>
    <Footer />
  </>
);

export default Layout;
