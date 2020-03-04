/** @jsx jsx */
import { jsx } from '@emotion/core';

import { HomepageSection } from './HomepageSection';
import { VideoIntro } from './VideoIntro';

const SectionGettingStarted = () => (
  <HomepageSection
    description="A KeystoneJS instance can be summarised as a function of your schema which creates a GraphQL API for querying, and an AdminUI for managing your data."
    heading="Get started in minutes"
    variant="dark"
    ctaTo="guides/schema"
    ctaText="Learn more"
  >
    <VideoIntro />
  </HomepageSection>
);

export { SectionGettingStarted };
