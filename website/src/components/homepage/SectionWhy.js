/** @jsx jsx */
import { jsx } from '@emotion/core';
import { colors } from '@arch-ui/theme';

import { Button } from '../../components/';
import { HomepageSection } from './HomepageSection';

const cards = [
  {
    heading: `Extensible`,
    content: `KeystoneJS ships with a powerful CMS and GraphQL API out of the box, which can be fine-tuned at any point across the stack`,
  },
  {
    heading: `BYO Database`,
    content: `Provide your own database for to Keystone to connect to, which can be either a MongoDB or PostgreSQL`,
  },
  {
    heading: `Deploy anywhere`,
    content: `Host your database and files anywhere you want to. You own your data.`,
  },
  {
    heading: `Powerful Authentication`,
    content: `Gatsby is an extremely popular static site generator based on React. It offers a great developer experience thanks to a huge selection of plugins.`,
  },

  {
    heading: `Get started in minutes`,
    content: `KeystoneJS provides a simple node CLI to get create new projects in minutes`,
  },
  {
    heading: `Production Ready`,
    content: `KeystoneJS can be (and is!) used for production websites and applications`,
  },
];

const SectionWhy = () => (
  <HomepageSection
    description="See why KeystoneJS differs from other projects"
    heading="Why KeystoneJS"
  >
    <Grid>
      {cards.map((card, i) => (
        <Card key={i}>
          <CardHeading>{card.heading}</CardHeading>
          <CardContent>{card.content}</CardContent>
          <Button variant="link" to="/" css={{ padding: 0, marginTop: 'auto' }}>
            &rarr; Learn more
          </Button>
        </Card>
      ))}
    </Grid>
  </HomepageSection>
);

const Grid = props => (
  <div css={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridGap: 36 }} {...props} />
);

const Card = props => (
  <div
    css={{
      display: 'flex',
      flexDirection: 'column',
      boxShadow: `0 5px 20px rgba(0,0,0,.08)`,
      borderRadius: 4,
      padding: 24,
    }}
    {...props}
  />
);

const CardContent = props => (
  <p css={{ lineHeight: 1.4, margin: `0 0 1rem 0`, color: colors.N60, flex: 1 }} {...props} />
);

const CardHeading = props => (
  <h3
    css={{
      color: colors.primary,
      fontSize: '1.25rem',
      lineHeight: '1',
      margin: `0 0 1rem 0`,
    }}
    {...props}
  />
);

export { SectionWhy };
