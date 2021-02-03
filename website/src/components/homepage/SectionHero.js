/** @jsx jsx */
import { jsx } from '@emotion/core';
import { colors } from '@arch-ui/theme';

import { Button } from '..';
import { media } from '../../utils/media';

import { HomepageSection } from './HomepageSection';
import { VideoIntro } from './VideoIntro';

const SectionHero = () => (
  <HomepageSection>
    <Grid>
      <div>
        <Heading>Headless&nbsp;CMS &amp; GraphQL&nbsp;API for&nbsp;Node</Heading>
        <Description>
          Configure your schema in JavaScript, and KeystoneJS will generate a powerful GraphQL API
          and CMS.
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
            appearance="secondary"
            variant="solid"
            to="/documentation/"
            css={{
              [media.sm]: { marginRight: 4 },
            }}
          >
            Documentation
          </Button>
          <Button
            appearance="secondary"
            variant="solid"
            to="/blog"
            css={{
              [media.sm]: { marginRight: 4 },
            }}
          >
            Blog
          </Button>
          <Button
            variant="link"
            href="https://github.com/keystonejs/keystone"
            rel="noopener noreferrer"
            target="_blank"
            css={{
              [media.sm]: { marginLeft: 4 },
            }}
          >
            View on GitHub
          </Button>
        </ButtonWrapper>
      </div>
      <VideoColumn>
        <VideoIntro />
      </VideoColumn>
    </Grid>
  </HomepageSection>
);

const Grid = props => (
  <div
    css={{
      display: 'grid',
      gridGap: '2rem',
      alignItems: 'center',
      justifyContent: 'start',
      textAlign: 'center',

      [media.sm]: {
        textAlign: 'left',
        gridTemplateColumns: 'repeat(2, 1fr)',
      },
    }}
    {...props}
  />
);

const Heading = props => (
  <h1
    css={{
      color: colors.N100,
      fontSize: '2.25rem',
      lineHeight: 1.2,
      fontWeight: 600,
      marginTop: 0,
      marginBottom: '1.75rem',

      [media.sm]: {
        fontSize: '2.75rem',
      },
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
    css={{
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
      alignItems: 'center',

      [media.sm]: {
        justifyContent: 'flex-start',
        flexDirection: 'row',
      },
    }}
    {...props}
  />
);

const VideoColumn = props => (
  <div
    css={{
      [media.sm]: {
        marginLeft: '2rem',
      },
    }}
    {...props}
  />
);

export { SectionHero };
