/** @jsx jsx */
import { jsx } from '@emotion/core';

import { Button } from '..';
import { colors } from '@arch-ui/theme';
import { media, mediaMax, mq } from '../../utils/media';

import { HomepageSection } from './HomepageSection';

const SectionHero = () => (
  <HomepageSection>
    <div css={{ textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
      <Heading>An open-source, scalable platform and CMS to build NodeJS applications</Heading>
    </div>
    <div css={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
      <div>
        <p css={{ fontSize: '1.25rem', lineHeight: 1.3, color: colors.N60 }}>
          Keystone 5 introduces first-class GraphQL support, a new extensible architecture, and an
          improved Admin UI.
        </p>
      </div>
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
  </HomepageSection>
);

// ==============================
// Misc
// ==============================

const Heading = props => (
  <h1
    css={{
      color: colors.N100,
      fontSize: '2.75rem',
      lineHeight: 1.3,
      fontWeight: 600,
      margin: `0 0 1rem 0`,
    }}
    {...props}
  />
);
const ButtonWrapper = props => (
  <div
    css={mq({
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'center',
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
