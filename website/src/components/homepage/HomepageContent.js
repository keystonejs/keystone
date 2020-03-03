/** @jsx jsx */
import { jsx } from '@emotion/core';

import { Button } from '../../components';
import { colors } from '@arch-ui/theme';
import { media, mediaMax, mq } from '../../utils/media';

const HomepageContent = () => (
  <div>
    <Heading>A scalable platform and CMS to build Node.js applications</Heading>
    <div>
      <p css={{ fontSize: '1.5rem' }}>
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
);

// ==============================
// Misc
// ==============================

const Heading = props => (
  <h1
    css={{
      color: colors.N100,
      fontSize: '3.2rem',
      lineHeight: 1.2,
      fontWeight: 800,
      margin: 0,
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

export { HomepageContent };
