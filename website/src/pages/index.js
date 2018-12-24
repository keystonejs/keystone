import React from 'react';
import { Link } from 'gatsby';
/* @jsx jsx */
import { jsx, Global } from '@emotion/core';

import Layout from '../templates/layout';

import { colors } from '../styles';

//import { colors } from '@voussoir/ui/src/theme';

export default ({ data }) => (
  <Layout>
    <h1 css={{ marginTop: 0 }}>Node.js CMS &amp; web app platform</h1>
    <p>
      KeystoneJS is an open source framework for developing database-driven websites, applications
      and APIs in Node.js. Built on Express and MongoDB.
    </p>
    <h2>
      Start here{' '}
      <span role="img" aria-label="hand pointing right">
        👉
      </span>{' '}
      <Link to="/docs">/docs</Link>
    </h2>
  </Layout>
);

// export const query = graphql`
//   query Index {
//     allSitePage(filter: { path: { ne: "/dev-404-page/" } }, sort: { fields: [path] }) {
//       totalCount
//       edges {
//         node {
//           path
//           context {
//             workspace
//           }
//         }
//       }
//     }
//   }
// `;
