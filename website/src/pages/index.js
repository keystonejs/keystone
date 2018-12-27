import React from 'react';
import { Link } from 'gatsby';
/* @jsx jsx */
import { jsx, Global } from '@emotion/core';

import { colors, KSButton } from '../styles';

import Header from '../components/Header';
import Footer from '../components/Footer';

//import { colors } from '@voussoir/ui/src/theme';

const Hero = () => (
  <div
    css={{
      textAlign: 'center',
      background: '#1385E5',
      color: 'white',
      height: 'calc(100vh - 48px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <div css={{ maxWidth: 600 }}>
      <h1 css={{ fontSize: '3em', margin: 0 }}>KeystoneJS</h1>
      <p css={{ color: 'rgba(255,255,255,0.66)', fontSize: '1.25em' }}>
        Keystone is an open source framework for developing database driven websites and
        applications, using NodeJS and GraphQL
      </p>
      <div
        css={{
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        <KSButton primary onDark href="/getting-started">
          Get Started
        </KSButton>
        <KSButton onDark href="#">
          Try the Demo
        </KSButton>
      </div>
    </div>
  </div>
);

const GetStartedRightNow = () => (
  <div
    css={{
      textAlign: 'center',
      background: '#DEEDFF',
      padding: 50,
    }}
  >
    <h2>Get Started Right Now</h2>
    <p>Hello</p>
    <code>
      <div
        css={{
          background: 'black',
          borderRadius: 8,
          padding: 16,
          textAlign: 'left',
          maxWidth: 450,
          color: 'white',
          fontSize: '1.3em',
          margin: '0 auto',
        }}
      >
        yarn create keystone-app my-project
        <br />
        cd my-project
        <br />
        yarn start
      </div>
    </code>
    <KSButton primary href="/">
      Get Started
    </KSButton>
  </div>
);

export default ({ data }) => (
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
    <Hero />
    <h2>
      Start here{' '}
      <span role="img" aria-label="hand pointing right">
        👉
      </span>{' '}
      <Link to="/docs">/docs</Link>
    </h2>
    <GetStartedRightNow />
    <Footer />
  </>
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
