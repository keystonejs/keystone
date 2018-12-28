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
      background: `linear-gradient(to bottom right, rgba(0,50,200,0.8), rgba(0,50,200,0.0)), ${
        colors.B.base
      }`,
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
        applications, using NodeJS and GraphQL.
      </p>
      <div
        css={{
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        <KSButton primary onDark href="#getStartedNow">
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
    id="getStartedNow"
    css={{
      textAlign: 'center',
      background: '#DEEDFF',
      padding: '50px 0',
    }}
  >
    <div
      css={{
        maxWidth: 500,
        margin: '0 auto',
      }}
    >
      <h2>Get Started Right Now</h2>
      <p>
        Sound like what you've been looking for? Check out the getting started guide or run the code
        snippit below to be up-and-running in less than a minute.
      </p>
      <code>
        <div
          css={{
            background: 'black',
            borderRadius: 8,
            lineHeight: '1.75em',
            padding: 16,
            maxWidth: 400,
            textAlign: 'left',
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
      <div css={{ display: 'inline-flex' }}>
        <KSButton primary href="/">
          Get Started
        </KSButton>
      </div>
    </div>
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
