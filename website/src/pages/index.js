/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { jsx, Global } from '@emotion/core';
import { colors, globalStyles } from '@arch-ui/theme';

import { Button, Container, Header } from '../components';

export default () => (
  <>
    <Global styles={globalStyles} />
    <Header key="global-header" style={{ position: 'fixed', left: 0, right: 0, top: 0 }} />
    <Hero />
    <Five />

    {/* <Footer textCenter /> */}
  </>
);

const Five = () => (
  <svg
    viewBox="0 0 10.5 10.5"
    style={{
      position: 'fixed',
      top: 0,
      right: 0,
      height: '100vh',
      width: '100vh',
      userSelect: 'none',
      zIndex: -1,
    }}
  >
    <text
      x="2"
      y="8"
      fill={colors.B.A10}
      style={{ fontFamily: 'Georgia, Times, serif', fontWeight: 'bold' }}
    >
      5
    </text>
  </svg>
);

const Hero = () => (
  <div
    css={{
      alignItems: 'center',
      display: 'flex',
      fontSize: 18,
      height: '100vh',
    }}
  >
    <Container>
      {/* <img alt="Keystone JS" src={logosvg} css={{ width: 60, marginBottom: 12 }} /> */}

      <div css={{ paddingRight: '18vw' }}>
        <h1
          css={{
            color: colors.N100,
            fontSize: '4em',
            fontWeight: 800,
            lineHeight: 1,
            margin: 0,
          }}
        >
          Build amazing node.js applications, faster.
          {/* Get a headstart on your node.js application API */}
          {/* Build applications faster with Keystone 5, a node.js CMS and API provider */}
        </h1>

        <div css={{ color: colors.N80, margin: '3em 0', lineHeight: 1.6 }}>
          <p>
            Keystone 5 includes first-class GraphQL support, a modular architecture and an improved
            Admin UI.
          </p>
          <p>
            We're focusing less on serving the front-end, and more on providing a scalable platform
            for content management and node.js applications.
          </p>
          {/* <p>
            We've been building the next generation of KeystoneJS at Thinkmill and are excited to
            start sharing it with the community.
          </p> */}
        </div>
      </div>
      <div
        css={{
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        <Button
          appearance="primary"
          variant="solid"
          to="/quick-start"
          style={{ margin: 0, marginRight: 8 }}
        >
          Get Started
        </Button>
        <Button
          appearance="primary"
          href="https://github.com/keystonejs/keystone-5"
          style={{ margin: 0 }}
        >
          View on GitHub
        </Button>
      </div>
    </Container>
  </div>
);
