/** @jsx jsx */
import { jsx } from '@emotion/core';

import { HomepageSection } from './HomepageSection';
import { Grid, Card } from './HomepageCard';

const cards = [
  {
    heading: `Extensible`,
    content: `KeystoneJS ships with a powerful CMS and GraphQL API out of the box, which can be fine-tuned at any point across the stack`,
    to: '/',
  },
  {
    heading: `BYO Database`,
    content: `Provide your own database for to Keystone to connect to, which can be either a MongoDB or PostgreSQL`,
    to: '/',
  },
  {
    heading: `Deploy anywhere`,
    content: `Host your database and files anywhere you want to. You own your data.`,
    to: '/',
  },
  {
    heading: `Powerful Authentication`,
    content: `Gatsby is an extremely popular static site generator based on React. It offers a great developer experience thanks to a huge selection of plugins.`,
    to: '/',
  },
];

const SectionWhy = () => (
  <HomepageSection
    description="See how KeystoneJS differs from other projects"
    heading="Why KeystoneJS"
  >
    <Grid>
      {cards.map((card, i) => (
        <Card {...card} key={i} />
      ))}
    </Grid>
  </HomepageSection>
);

export { SectionWhy };
