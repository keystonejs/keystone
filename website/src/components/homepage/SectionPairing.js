/** @jsx jsx */
import { jsx } from '@emotion/core';
import { colors } from '@arch-ui/theme';

import { Button } from '../../components';
import { HomepageSection } from './HomepageSection';

const cards = [
  {
    heading: `NextJS`,
    content: `Next is a great option if you are familiar with React but want static-site generation, server-side rendering, Serverless deployment, and a growing ecosystem.`,
  },
  {
    heading: `NuxtJS`,
    content: `Great for SEO, Nuxt is a good choice if you're familiar with Vue and you are looking for static-site generation and server-side rendering.`,
  },
  {
    heading: `Static Files`,
    content: `Use the static app to use with any front-end framework such as: Angular, Vue, React, Svelte, Eleventy.`,
  },
];

const SectionPairing = () => (
  <HomepageSection
    description="KeystoneJS can be used as either a headless GraphQL API and optional CMS, or can be paired easily with any front-end framework."
    heading="Pair with the any front-end framework"
  >
    <Grid>
      {cards.map((card, i) => (
        <Card key={i}>
          <CardHeading>{card.heading}</CardHeading>
          <CardContent>{card.content}</CardContent>
          <CardCTA to="/">Read more</CardCTA>
        </Card>
      ))}
    </Grid>
  </HomepageSection>
);

const Grid = props => (
  <div
    css={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gridGap: '1.5rem',
    }}
    {...props}
  />
);

const Card = props => (
  <div
    css={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      boxShadow: `0 5px 20px rgba(0,0,0,.08)`,
      borderRadius: 4,
      padding: `1.5rem`,
      textAlign: 'center',
    }}
    {...props}
  />
);

const CardHeading = props => (
  <h3
    css={{
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1,
      marginTop: 0,
      marginBottom: '1rem',
    }}
    {...props}
  />
);

const CardContent = props => (
  <p css={{ lineHeight: 1.5, marginTop: 0, marginBottom: '2rem', color: colors.N60 }} {...props} />
);

const CardCTA = props => <Button appearance="primary" variant="solid" {...props} />;

export { SectionPairing };
