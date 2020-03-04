/** @jsx jsx */
import { jsx } from '@emotion/core';
import { colors } from '@arch-ui/theme';

import { HomepageSection } from './HomepageSection';

const cards = [
  {
    heading: `Create your schema`,
    content: `Gatsby is an extremely popular static site generator based on React. It offers a great developer experience thanks to a huge selection of plugins.`,
  },
  {
    heading: `Create your schema`,
    content: `Gatsby is an extremely popular static site generator based on React. It offers a great developer experience thanks to a huge selection of plugins.`,
  },
  {
    heading: `Create your schema`,
    content: `Gatsby is an extremely popular static site generator based on React. It offers a great developer experience thanks to a huge selection of plugins.`,
  },
  {
    heading: `Create your schema`,
    content: `Gatsby is an extremely popular static site generator based on React. It offers a great developer experience thanks to a huge selection of plugins.`,
  },
  {
    heading: `Create your schema`,
    content: `Gatsby is an extremely popular static site generator based on React. It offers a great developer experience thanks to a huge selection of plugins.`,
  },
  {
    heading: `Create your schema`,
    content: `Gatsby is an extremely popular static site generator based on React. It offers a great
            developer experience thanks to a huge selection of plugins.`,
  },
];

const SectionWhy = () => (
  <HomepageSection
    description="A KeystoneJS instance can be summarised as a function of your schema which creates a GraphQL API for querying, and an AdminUI for managing your data."
    heading="Why KeystoneJS"
  >
    <Grid>
      {cards.map((card, i) => (
        <Card key={i}>
          <CardHeading>{card.heading}</CardHeading>
          <CardContent>{card.content}</CardContent>
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
  <p css={{ lineHeight: 1.4, margin: 0, color: colors.N60 }} {...props} />
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
