/** @jsx jsx */

import { jsx, Global } from '@emotion/core';
import { globalStyles } from '@arch-ui/theme';
import { SkipNavContent } from '@reach/skip-nav';

import { Layout } from '../templates/layout';
import { Sidebar } from '../components';

import { SectionHero } from '../components/homepage/SectionHero';
import { SectionCode } from '../components/homepage/SectionCode';
import { SectionFeatures } from '../components/homepage/SectionFeatures';
import { SectionTechnology } from '../components/homepage/SectionTechnology';
import { HomepageFooter } from '../components/homepage/HomepageFooter';

const Homepage = () => (
  <>
    <Layout>
      {({ sidebarIsVisible, toggleSidebar }) => (
        <>
          <Global styles={globalStyles} />
          <Sidebar isVisible={sidebarIsVisible} toggleSidebar={toggleSidebar} mobileOnly />
          <SkipNavContent />
          <SectionHero />
          <SectionCode />
          <SectionFeatures />
          <SectionTechnology />
          <HomepageFooter />
        </>
      )}
    </Layout>
  </>
);

export default Homepage;
