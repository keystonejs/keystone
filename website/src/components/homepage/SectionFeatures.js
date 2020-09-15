/** @jsx jsx */
import { jsx } from '@emotion/core';

import { HomepageSection } from './HomepageSection';
import { Grid, Card } from './HomepageCard';

const CARDS = [
  {
    heading: `Fully featured`,
    content: `Zero assumptions doesn’t mean zero features. Keystone comes with dozens of features out of the box including Lists, Fields, Access Control, Authentication, and Apps. You can add and configure each of these, as well as extend, modify or build your own.`,
    to: '/guides/apps',
  },
  {
    heading: `Highly extensible`,
    content: `KeystoneJS provides an extensible admin interface and a powerful GraphQL API. These tools, and the building blocks Keystone provides, will allow you to create any type of application.`,
    to: '/guides/graphql-philosophy',
  },
  {
    heading: `Own your data`,
    content: `Provide your own PostgreSQL or MongoDB database for Keystone to connect to, and deploy your application anywhere. Have complete freedom of choice when hosting your data, API, and front-end and admin applications.`,
    to: '/guides/deployment',
  },
  {
    heading: `Get started in minutes`,
    content: `Our quick start guide will get you up and running in just a few minutes. Let's build a simple todo app with a fresh install of Keystone!`,
    to: '/quick-start',
  },
];

const SectionFeatures = () => (
  <HomepageSection
    heading="Why KeystoneJS"
    description="We believe it’s the ideal back-end for React, Vue or Angular applications, Gatsby and Next.js websites, static sites, mobile applications and more."
  >
    <Grid>
      {CARDS.map((card, i) => (
        <Card {...card} key={i} />
      ))}
    </Grid>
  </HomepageSection>
);

export { SectionFeatures };
