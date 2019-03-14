/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { jsx, Global } from '@emotion/core';
import { colors, globalStyles } from '@arch-ui/theme';
import { Button, Container, Header } from '../components';
import Illustration from '../images/illustration.svg';

export default () => (
  <>
    <Global styles={globalStyles} />
    <Header key="global-header" style={{ position: 'fixed', left: 0, right: 0, top: 0 }} />
    <Hero />

    {/* <Footer textCenter /> */}
  </>
);

const Hero = () => (
  <div
    css={{
      display: 'flex',
      fontSize: 18,
      minHeight: '100vh',
    }}
  >
    <Container
      css={{
        display: 'flex',
        '@media (max-width: 920px)': {
          flexDirection: 'column',
          marginTop: 70,
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
