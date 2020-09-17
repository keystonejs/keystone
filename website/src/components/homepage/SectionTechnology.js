/** @jsx jsx */
import { jsx } from '@emotion/core';

import { Grid, Card } from './HomepageCard';
import { HomepageSection } from './HomepageSection';

const CARDS = [
  {
    heading: `Static Files`,
    content: `Serve HTML, CSS, JS, images and any other static resources using an Express static server. This can be quick and easy way to deploy a simple front-end with a KeystoneJS application.`,
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
  {
    heading: `Headless`,
    content: `The primary focus of KeystoneJS is the GraphQL API and Admin UI. Because of this KeystoneJS works with all major front-end frameworks and is headless by default.`,
    to: `/keystonejs/app-graphql/`,
  },
];

const SectionTechnology = () => (
  <HomepageSection
    variant="dark"
    description="KeystoneJS integrates seamlessly with any front-end framework, but can also be run as a headless GraphQL API with optional Admin UI."
    heading="Use with the technology of your choice"
  >
    <Grid>
      {CARDS.map((card, i) => (
        <Card key={i} {...card} variant="dark" />
      ))}
    </Grid>
  </HomepageSection>
);

export { SectionTechnology };
