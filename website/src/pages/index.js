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
          overflow: 'hidden',
        },
      }}
    />
    <Hero />
    <p
      css={{
        fontSize: 1100,
        fontWeight: 900,
        position: 'absolute',
        lineHeight: 0,
        margin: 0,
        zIndex: -1,
        top: 320,
        right: 0,
        color: '#2684FF',
        opacity: 0.2,
      }}
    >
      5
    </p>
    <Footer />
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

        <div css={{ color: '#596d88', margin: '20px 0' }}>
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
            href="https://docs.google.com/forms/d/e/1FAIpQLSfOrULmIgp10UiLSKyvJP_hWQ6R5tz5f5l9sRosG6Myrt_2_Q/viewform?usp=sf_link"
            style={{ margin: 0, marginRight: 8 }}
          >
            Join the Preview
          </Button>
          <Button href="/tutorials/getting-started" style={{ margin: 0 }}>
            Read the Docs
          </Button>
        </div>
      </div>
    </div>
  </div>
);
