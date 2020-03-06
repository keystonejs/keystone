/** @jsx jsx */
import { jsx } from '@emotion/core';

import { HomepageSection } from './HomepageSection';
import { Grid, Card } from './HomepageCard';

const cards = [
  {
    heading: `Highly extensible`,
    content: `KeystoneJS provides an extensible Admin Interface and a powerful GraphQL API. These tools, and the building blocks Keystone provides, will allow you to create any type of application.`,
    to: '/',
  },
  {
    heading: `Own your data`,
    content: `Provide your own PostgreSQL or MongoDB database for to Keystone to connect to deploy your application anywhere.`,
    to: '/quick-start/adapters',
  },
  {
    heading: `GraphQL Philosphy`,
    content: `KeystoneJS can be run as a headless GraphQL API and optional CMS, or be paired seamlessly with any front-end framework`,
    to: '/guides/graphql-philosophy',
  },
  {
    heading: `Get started in minutes`,
    content: `This quick start guide will get you up and running in just a few minutes. Let's build a simple todo app with a fresh install of Keystone 5!`,
    to: '/quick-start',
  },
];

const SectionWhy = () => (
  <HomepageSection description="See what makes KeystoneJS so powerful" heading="Why KeystoneJS">
    <Grid>
      {cards.map((card, i) => (
        <Card {...card} key={i} />
      ))}
    </Grid>
  </HomepageSection>
);

export { SectionWhy };
