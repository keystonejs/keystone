import React from 'react'; // eslint-disable-line no-unused-vars
import { jsx } from '@emotion/core';
/** @jsx jsx */

import Button from '../components/Button';

export default () => (
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
        Sound like what you've been looking for? Check out the getting started guide to be
        up-and-running in less than a minute.
      </p>
      <div css={{ display: 'inline-flex' }}>
        <Button appearance="primary" href="/guides/getting-started">
          Get Started
        </Button>
      </div>
    </div>
  </div>
);
