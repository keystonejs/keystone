/** @jsx jsx */

import React from 'react'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { jsx, Global } from '@emotion/core';
import { globalStyles, gridSize } from '@arch-ui/theme';
import { SkipNavContent } from '@reach/skip-nav';

import { Layout } from '../templates/layout';
import { Container, Sidebar } from '../components';
import { mq } from '../utils/media';

export default () => (
  <Layout>
    {({ sidebarIsVisible }) => (
      <>
        <Global styles={globalStyles} />
        <Container>
          <Sidebar isVisible={sidebarIsVisible} mobileOnly />
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
        If you were looking for the Keystone version 4 documentation, it has been moved{' '}
        <a href="https://v4.keystonejs.com/">here</a>.
      </p>
    </Container>
  </div>
);
