/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { jsx, Global } from '@emotion/core';
import { globalStyles, colors } from '@arch-ui/theme';
import { SkipNavContent } from '@reach/skip-nav';

import Layout from '../templates/layout';
import { Container, Sidebar } from '../components';

import { SectionHero } from '../components/homepage/SectionHero';
import { SectionAbout } from '../components/homepage/SectionAbout';
import { SectionPairing } from '../components/homepage/SectionPairing';
import { SectionWhy } from '../components/homepage/SectionWhy';
import { SectionGettingStarted } from '../components/homepage/SectionGettingStarted';

export default () => (
  <Layout>
    {({ sidebarIsVisible, sidebarOffset }) => (
      <>
        <Global styles={globalStyles} />
        <Container>
          <Sidebar isVisible={sidebarIsVisible} offsetTop={sidebarOffset} mobileOnly />
        </Container>
        <SkipNavContent />
        <SectionHero />
        <SectionAbout />
        <SectionWhy />
        <SectionGettingStarted />
        <SectionPairing />
        <div
          css={{
            paddingTop: 80,
            paddingBottom: 80,
            textAlign: 'center',
            borderTop: '1px solid #ccc',
          }}
        >
          <Container>
            <p css={{ color: colors.N40, fontSize: '0.9em' }}>
              Keystone 5 is built by{' '}
              <a css={{ color: colors.N80 }} href="https://www.thinkmill.com.au">
                Thinkmill
              </a>{' '}
              and{' '}
              <a
                css={{ color: colors.N80 }}
                href="https://github.com/keystonejs/keystone-5/blob/master/CONTRIBUTING.md#contributors"
              >
                Contributors
              </a>{' '}
              around the world.
            </p>

            <p css={{ color: colors.N40, fontSize: '0.9em' }}>
              Keystone v4 has moved to{' '}
              <a css={{ color: colors.N80 }} href="http://v4.keystonejs.com">
                v4.keystonejs.com
              </a>
              .{' '}
            </p>
          </Container>
        </div>
      </>
    )}
  </Layout>
);
