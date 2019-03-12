import React from 'react'; // eslint-disable-line no-unused-vars
import { jsx, Global } from '@emotion/core';

/** @jsx jsx */

import { colors } from '@arch-ui/theme';
import Button from '../components/Button';
import Footer from '../components/Footer';
import logosvg from '../images/logo.svg';

export default () => (
  <>
    <Global
      styles={{
        body: {
          margin: 0,
          color: colors.B.D55,
          fontFamily: 'system-ui, BlinkMacSystemFont, -apple-system, Segoe UI, Roboto,sans-serif',
        },
      }}
    />
    <Hero />
    <p
      css={{
        fontSize: 'calc(calc(130vh - 16px) - 1rem)',
        fontWeight: 900,
        position: 'absolute',
        lineHeight: 1,
        margin: 0,
        zIndex: -1,
        top: '-0.2em',
        right: 0,
        color: '#2684FF',
        opacity: 0.2,
      }}
    >
      5
    </p>
    <Footer textCenter />
  </>
);

const Hero = () => (
  <div css={{ maxWidth: 1200, margin: '0 auto' }}>
    <div
      css={{
        display: 'flex',
        // justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 48px)',
      }}
    >
      <div css={{ maxWidth: 600, padding: 32 }}>
        <img alt="Keystone JS" src={logosvg} css={{ width: 60, marginBottom: 12 }} />

        <h1
          css={{
            fontSize: '4em',
            fontWeight: 800,
            margin: 0,
            color: '#224A7E',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}
        >
          This is
          <br />
          Keystone 5
        </h1>

        <div css={{ color: '#596d88', margin: '20px 0', lineHeight: 1.5 }}>
          <p>It’s a major re-imagining of Keystone for 2019 and beyond.</p>

          <p>
            Keystone 5 includes first-class GraphQL support, a modular architecture and a completely
            new Admin UI. We're focusing less on serving the front-end, and more on providing a
            scalable platform for content management and node.js applications.
          </p>
          <p>
            We've been building the next generation of KeystoneJS at Thinkmill and are excited to
            start sharing it with the community.
          </p>
        </div>
        <div
          css={{
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          <Button
            appearance="primary"
            href="/getting-started"
            style={{ margin: 0, marginRight: 8 }}
          >
            Get Started
          </Button>
          <Button href="https://github.com/keystonejs/keystone-5" style={{ margin: 0 }}>
            View on GitHub
          </Button>
        </div>
      </div>
    </div>
  </div>
);
