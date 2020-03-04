/** @jsx jsx */
import { jsx } from '@emotion/core';

import { HomepageSection } from './HomepageSection';
import { VideoIntro } from './VideoIntro';

const SectionGettingStarted = () => (
  <HomepageSection
    description="This quick start guide will get you up and running in just a few minutes. Let's build a simple todo app with a fresh install of KeystoneJS"
    heading="Get started in minutes"
    variant="dark"
    ctaTo="guides/schema"
    ctaText="Learn more"
  >
    <VideoIntro />
  </HomepageSection>
);

export { SectionGettingStarted };
