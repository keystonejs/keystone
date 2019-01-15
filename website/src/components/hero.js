import React from 'react'; // eslint-disable-line no-unused-vars
import { jsx } from '@emotion/core';
/** @jsx jsx */

import { colors } from '@voussoir/ui/src/theme';
import Button from '../components/Button';

export default () => (
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
        <Button appearance="primary-light" href="/tutorials/getting-started">
          Get Started
        </Button>
        <Button appearance="light" href="https://github.com/keystonejs/keystone-5">
          View on GitHub
        </Button>
      </div>
    </div>
  </div>
);
