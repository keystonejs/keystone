/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { jsx, Global } from '@emotion/core';
import { globalStyles, gridSize } from '@arch-ui/theme';
import { SkipNavContent } from '@reach/skip-nav';

import Layout from '../templates/layout';
import { Container, Sidebar } from '../components';
import { mq } from '../utils/media';

export default () => (
  <Layout>
    {({ sidebarIsVisible, sidebarOffset }) => (
      <>
        <Global styles={globalStyles} />
        <Container>
          <Sidebar isVisible={sidebarIsVisible} offsetTop={sidebarOffset} mobileOnly />
        </Container>
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
        css={mq({
          marginTop: 0,
          fontSize: ['2.4rem', '3.2rem'],
          lineHeight: 1,
        })}
      >
        Page Not Found
      </h1>
      <p>We couldn't find what you were looking for.</p>
      <p>
        If you were looking for the Keystone version 4 the docs these have moved to:{' '}
        <a href="https://v4.keystonejs.com/">https://v4.keystonejs.com/</a>.
      </p>
    </Container>
  </div>
);
