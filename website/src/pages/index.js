/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { jsx, Global } from '@emotion/core';
import { colors, globalStyles } from '@arch-ui/theme';

/** @jsx jsx */

import { colors } from '@arch-ui/theme';
import Button from '../components/Button';
import Footer from '../components/Footer';
import Illustration from '../images/illustration.svg';

export default () => (
  <>
    <Global styles={globalStyles} />
    <Header key="global-header" style={{ position: 'fixed', left: 0, right: 0, top: 0 }} />
    <div css={{ maxWidth: 1100, margin: '0 auto' }}>
      <div
        css={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(350px,1fr))',
          alignItems: 'center',
          height: '100vh',
          padding: 32,
        }}
      >
        <div css={{ color: '#051025' }}>
          <h1
            css={{
              fontSize: 40,
            }}
          >
            Keystone 5 Alpha is here
          </h1>

          <p css={{ fontWeight: 600, fontSize: 24 }}>
            Scalable platform to build awesome CMS and Node.js apps.
          </p>
          <p>
            Now comes with first-class GraphQL support, a modular architecture and redesigned Admin
            UI.
          </p>
          <div
            css={{
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <Button appearance="primary" href="/quick-start" style={{ margin: 0, marginRight: 8 }}>
              Get Started
            </Button>
            <a
              href="https://github.com/keystonejs/keystone-5"
              style={{ marginLeft: 30, color: '#051025', fontWeight: 600 }}
            >
              View on GitHub
            </a>
          </div>
          <p css={{ color: '#8E8E93' }}>
            Keystone 5 is currently in alpha release and under intensive development by Thinkmill
            and contributors around the world.
          </p>
        </div>
        <img src={Illustration} style={{ marginLeft: '-5em', zIndex: -1 }} />
      </div>
    </div>
  </>
);
