/** @jsx jsx */
import { jsx } from '@emotion/core';
import { colors } from '@arch-ui/theme';

import { Button } from '../../components';
import { HomepageSection } from './HomepageSection';

const cards = [
  {
    heading: `Next.js App`,
    content: `Take the pain out of creating Universal React apps with Next.js. Next.js is Zero Setup, Fully Extensible and Ready for Production.`,
    to: `/keystonejs/app-next/`,
  },
  {
    heading: `Nuxt.js App`,
    content: `Nuxt is a progressive framework based on Vue.js to create modern web applications. It can be used to create from static landing pages to complex enterprise ready web applications.`,
    to: `/keystonejs/app-nuxt/`,
  },
  {
    heading: `Static App`,
    content: `Use the Static App to serve static HTML, CSS, JS and other files`,
    to: `/keystonejs/app-static/`,
  },
];

const SectionPairing = () => (
  <HomepageSection
    variant="dark"
    description="KeystoneJS is powered by Express, so it can be paired easily with many popular front-end frameworks"
    heading="Use in headless mode, or with any front-end framework"
  >
    <Grid>
      {cards.map((card, i) => (
        <Card key={i}>
          <CardHeading>{card.heading}</CardHeading>
          <CardContent>{card.content}</CardContent>
          <CardCTA to={card.to}>Read more</CardCTA>
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
      backgroundColor: colors.B.D70,
      boxShadow: `0 5px 20px rgba(0,0,0,.08)`,
      borderRadius: 4,
      padding: `2rem`,
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
      marginBottom: '2rem',
    }}
    {...props}
  />
);

const CardContent = props => (
  <p
    css={{ lineHeight: 1.5, marginTop: 0, marginBottom: '2rem', color: colors.N40, flex: 1 }}
    {...props}
  />
);

const CardCTA = props => <Button appearance="primary" variant="solid" {...props} />;

export { SectionPairing };
