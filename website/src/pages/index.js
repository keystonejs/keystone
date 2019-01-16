import React from 'react'; // eslint-disable-line no-unused-vars
import { Link } from 'gatsby';
import { jsx, Global } from '@emotion/core';

/** @jsx jsx */

import { colors } from '@voussoir/ui/src/theme';

import Header from '../components/Header';
import Footer from '../components/Footer';
import GetStartedRightNow from '../components/getStartedRightNow';
import Hero from '../components/hero';

export default () => (
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
      <Link to="/tutorials">/tutorials</Link>
    </h2>
    <GetStartedRightNow />
    <Footer />
  </>
);
