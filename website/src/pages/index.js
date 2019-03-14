/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { jsx, Global } from '@emotion/core';
import { colors, globalStyles } from '@arch-ui/theme';
import { Button, Container, Header } from '../components';
import Illustration from '../images/illustration.svg';

export default () => (
  <>
    <Global styles={globalStyles} />
    <Header key="global-header" />
    <Hero />

    {/* <Footer textCenter /> */}
  </>
);

const Hero = () => (
  <div
    css={{
      display: 'flex',
      minHeight: '100vh',
    }}
  >
    <Container
      css={{
        display: 'flex',
        '@media (max-width: 920px)': {
          flexDirection: 'column',
          marginTop: 50,
          textAlign: 'center',
        },

        '@media (min-width: 920px)': {
          alignItems: 'center',
        },
      }}
    >
      <div css={{ flex: 1 }}>
        <h1
          css={{
            color: colors.N100,
            fontSize: '3em',
            fontWeight: 800,
            lineHeight: 1,
            margin: 0,

            '@media (max-width: 920px)': {
              fontSize: '1.5em',
            },
          }}
        >
          Build amazing node.js applications, faster.
          {/* Get a headstart on your node.js application API */}
          {/* Build applications faster with Keystone 5, a node.js CMS and API provider */}
        </h1>

        <div css={{ color: colors.N80, fontSize: 18, margin: '3em 0', lineHeight: 1.6 }}>
          <p>
            Keystone 5 includes first-class GraphQL support, a modular architecture and an improved
            Admin UI.
          </p>
          <p>
            We're focusing less on serving the front-end, and more on providing a scalable platform
            for content management and node.js applications.
          </p>
        </div>
        <div
          css={{
            display: 'inline-flex',
            alignItems: 'center',
            '@media (max-width: 920px)': {
              flexDirection: 'column',
            },
          }}
        >
          <Button appearance="primary" variant="solid" to="/quick-start" style={{ marginRight: 8 }}>
            Get Started
          </Button>
          <a
            href="https://github.com/keystonejs/keystone-5"
            style={{ margin: '0', color: 'black', textDecoration: 'underline' }}
          >
            View on GitHub
          </a>
        </div>
        <p css={{ color: '#8E8E93', lineHeight: 1.6 }}>
          Keystone 5 is currently in alpha release and under intensive development by Thinkmill and
          contributors around the world.
        </p>
      </div>
      <div css={{ zIndex: -1, flex: 1 }}>
        <img src={Illustration} style={{ marginLeft: '-5em', marginRight: '-40px' }} />
      </div>
    </Container>
  </div>
);
