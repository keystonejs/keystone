import React from 'react';
import { graphql, Link } from 'gatsby';
import { thing } from '@voussoir/ui/src/utils';
/* @jsx jsx */
import { jsx, Global } from '@emotion/core';

// import { colors } from '../styles';

import { colors } from '@voussoir/ui/src/theme';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';

console.log(thing);

export default ({ data }) => (
  <div>
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
    <div css={{ display: 'flex', justifyContent: 'space-between' }}>
      <Sidebar data={data} />
      <div id="primary" css={{ padding: '32px' }}>
        <h1 css={{ marginTop: 0 }}>Node.js CMS &amp; web app platform</h1>
        <p>
          KeystoneJS is an open source framework for developing database-driven websites,
          applications and APIs in Node.js. Built on Express and MongoDB.
        </p>
        <h2>
          Start here{' '}
          <span role="img" aria-label="hand pointing right">
            👉
          </span>{' '}
          <Link to="/docs">/docs</Link>
        </h2>
      </div>
    </div>
    <Footer />
  </div>
);

export const pageQuery = graphql`
  query Index {
    allSitePage(filter: { path: { ne: "/dev-404-page/" } }, sort: { fields: [path] }) {
      totalCount
      edges {
        node {
          path
          context {
            workspace
          }
        }
      }
    }
  }
`;
