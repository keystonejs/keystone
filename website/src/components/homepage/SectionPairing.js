/** @jsx jsx */
import { jsx } from '@emotion/core';
import { colors } from '@arch-ui/theme';

import { Button } from '../../components';
import { HomepageSection } from './HomepageSection';

const cards = [
  {
    heading: `NextJS`,
    content: `Gatsby is an extremely popular static site generator based on React. It offers a great developer experience thanks to a huge selection of plugins.`,
  },
  {
    heading: `NuxtJS`,
    content: `Gatsby is an extremely popular static site generator based on React. It offers a great developer experience thanks to a huge selection of plugins.`,
  },
  {
    heading: `Static`,
    content: `Gatsby is an extremely popular static site generator based on React. It offers a great developer experience thanks to a huge selection of plugins.`,
  },
];

const SectionPairing = () => (
  <HomepageSection
    description="Every framework has its own properties and advantages, fast rendering, SEO, ease of deployment or progressive enhancement."
    heading="Pair with the technology of your choice"
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
      marginBottom: '2rem',
    }}
    {...props}
  />
);

const CardContent = props => (
  <p css={{ lineHeight: 1.4, marginTop: 0, marginBottom: '2rem' }} {...props} />
);

const CardCTA = props => <Button appearance="primary" variant="solid" {...props} />;

export { SectionPairing };
