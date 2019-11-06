/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { jsx, Global } from '@emotion/core';
import { globalStyles } from '@arch-ui/theme';
import { SkipNavContent } from '@reach/skip-nav';

import Layout from '../templates/layout';
import { HomepageContent } from '../components/homepage/HomepageContent';
import { VideoIntro } from '../components/homepage/VideoIntro';
import { CONTAINER_GUTTERS, CONTAINER_WIDTH } from '../components/Container';
import { HEADER_HEIGHT } from '../components/Header';
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
        <Hero />
      </>
    )}
  </Layout>
);

const CustomContainer = props => (
  <div
    css={mq({
      boxSizing: 'border-box',
      marginLeft: 'auto',
      marginRight: 'auto',
      paddingLeft: CONTAINER_GUTTERS,
      paddingRight: CONTAINER_GUTTERS,
      width: [null, null, 992, CONTAINER_WIDTH],
    })}
    {...props}
  />
);

const Hero = () => (
  <div css={{ overflow: 'hidden' }}>
    <SkipNavContent />
    <CustomContainer
      css={mq({
        maxWidth: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: ['flex-start', 'flex-start', 'flex-start', 'center'],
        flexDirection: ['column', 'column', 'column', 'row'],
        fontSize: [14, 18],
        lineHeight: 1.6,
        minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
      })}
    >
      <HomepageContent />
      <VideoIntro />
    </CustomContainer>
  </div>
);
