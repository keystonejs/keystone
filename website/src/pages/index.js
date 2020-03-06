/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { jsx, Global } from '@emotion/core';
import { globalStyles } from '@arch-ui/theme';
import { SkipNavContent } from '@reach/skip-nav';

import Layout from '../templates/layout';
import { Container, Sidebar } from '../components';

import { SectionHero } from '../components/homepage/SectionHero';
import { SectionAbout } from '../components/homepage/SectionAbout';
import { SectionPairing } from '../components/homepage/SectionPairing';
import { SectionWhy } from '../components/homepage/SectionWhy';
import { HomepageFooter } from '../components/homepage/HomepageFooter';

const Homepage = () => (
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
        <SectionPairing />
        <HomepageFooter />
      </>
    )}
  </Layout>
);

export default Homepage;
