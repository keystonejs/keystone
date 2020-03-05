/** @jsx jsx */
import { jsx } from '@emotion/core';

import { Button } from '..';
import { colors } from '@arch-ui/theme';
import { media, mediaMax, mq } from '../../utils/media';

import { HomepageSection } from './HomepageSection';
import { VideoIntro } from './VideoIntro';

const SectionHero = () => (
  <HomepageSection>
    <Grid>
      <div>
        <Heading>An open-source, scalable platform and CMS to build NodeJS applications</Heading>
        <Description>
          KeystoneJS comes with first-class GraphQL support, a highly extensible architecture, and a
          wonderful Admin UI
        </Description>
        <ButtonWrapper>
          <Button
            appearance="primary"
            variant="solid"
            to="/quick-start/"
            css={{
              [media.sm]: { marginRight: 4 },
            }}
          >
            Get Started
          </Button>
          <Button
            variant="link"
            href="https://github.com/keystonejs/keystone-5"
            css={{
              [media.sm]: { marginLeft: 4 },
            }}
            target="_blank"
          >
            View on GitHub
          </Button>
        </ButtonWrapper>
      </div>
      <VideoIntro />
    </Grid>
  </HomepageSection>
);

const Grid = props => (
  <div
    css={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gridGap: '2rem',
      alignItems: 'center',
    }}
    {...props}
  />
);

const Heading = props => (
  <h1
    css={{
      color: colors.N100,
      fontSize: '2.75rem',
      lineHeight: 1.2,
      fontWeight: 600,
      marginBottom: '2rem',
    }}
    {...props}
  />
);

const Description = props => (
  <p
    css={{
      fontSize: '1.25rem',
      lineHeight: 1.4,
      color: colors.N60,
      marginTop: 0,
      marginBottom: '2rem',
    }}
    {...props}
  />
);

const ButtonWrapper = props => (
  <div
    css={mq({
      alignItems: 'center',
      display: 'flex',
      margin: ['1em 0', '1em 0', '1em 0', '2em 0'],

      [mediaMax.xs]: {
        alignItems: 'stretch',
        flexDirection: 'column',
        margin: '2em auto',
      },
    })}
    {...props}
  />
);

export { SectionHero };
