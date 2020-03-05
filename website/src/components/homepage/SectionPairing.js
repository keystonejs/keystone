/** @jsx jsx */
import { jsx } from '@emotion/core';

import { Grid, Card } from './HomepageCard';
import { HomepageSection } from './HomepageSection';

const cards = [
  {
    heading: `Static Files`,
    content: `Use the Static App to serve static HTML, CSS, JS and other files`,
    to: `/keystonejs/app-static/`,
  },
  {
    heading: `Headless`,
    content: `Use the Static App to serve static HTML, CSS, JS and other files`,
    to: `/keystonejs/app-static/`,
  },
  {
    heading: `Next.js`,
    content: `Take the pain out of creating Universal React apps with Next.js. Next.js is Zero Setup, Fully Extensible and Ready for Production.`,
    to: `/keystonejs/app-next/`,
  },
  {
    heading: `Nuxt.js`,
    content: `Nuxt is a progressive framework based on Vue.js to create modern web applications. It can be used to create from static landing pages to complex enterprise ready web applications.`,
    to: `/keystonejs/app-nuxt/`,
  },
];

const SectionPairing = () => (
  <HomepageSection
    variant="dark"
    description="KeystoneJS can be run as a headless GraphQL API and optional CMS, or be paired seamlessly with any front-end framework"
    heading="Pair with the technology of your choice"
  >
    <Grid>
      {cards.map((card, i) => (
        <Card key={i} {...card} variant="dark" />
      ))}
    </Grid>
  </HomepageSection>
);

export { SectionPairing };
