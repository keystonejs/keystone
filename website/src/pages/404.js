/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { jsx, Global } from '@emotion/core';
import { globalStyles, gridSize } from '@arch-ui/theme';
import { SkipNavContent } from '@reach/skip-nav';

import Layout from '../templates/layout';
import { Container } from '../components/Container';

export default () => (
  <Layout>
    {() => (
      <>
        <Global styles={globalStyles} />
        <NotFound />
      </>
    )}
  </Layout>
);

const layoutGutter = gridSize * 4;

const NotFound = () => (
  <div>
    <SkipNavContent />
    <Container
      css={{
        paddingTop: layoutGutter,
        paddingBottom: layoutGutter,
      }}
    >
      <h1
        css={{
          marginTop: 0,
          fontSize: ['2.4rem', '3.2rem'],
          lineHeight: 1,
        }}
      >
        Page Not Found
      </h1>
      <p>We couldn't find what you were looking for.</p>
    </Container>
  </div>
);
