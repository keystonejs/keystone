/** @jsx jsx */
import { jsx } from '@emotion/core';

import { Button } from '../../components';
import { colors } from '@arch-ui/theme';
import { media, mediaMax, mq } from '../../utils/media';

const HomepageContent = () => (
  <Content>
    <Heading>Keystone 5</Heading>
    <div css={{ color: colors.N80, maxWidth: 640 }}>
      <p>A scalable platform and CMS to build Node.js applications.</p>
      <p>
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
    <p css={{ color: colors.N40, fontSize: '0.9em' }}>
      Keystone 5 is currently in alpha and under intensive development by{' '}
      <a css={{ color: colors.N80 }} href="https://www.thinkmill.com.au">
        Thinkmill
      </a>{' '}
      and{' '}
      <a
        css={{ color: colors.N80 }}
        href="https://github.com/keystonejs/keystone-5/blob/master/CONTRIBUTING.md"
      >
        contributors
      </a>{' '}
      around the world.
    </p>
  </Content>
);

// ==============================
// Misc
// ==============================

const Heading = props => (
  <h1
    css={{
      color: colors.N100,
      fontSize: '2.4em',
      fontWeight: 800,
      lineHeight: 1,
      margin: 0,

      [mediaMax.sm]: {
        marginTop: '1em',
      },
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

const Content = props => (
  <div
    css={{
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
      flex: '0 1 500px',

      [mediaMax.xs]: {
        textAlign: 'center',
      },
      // [mediaOnly.md]: {
      //   paddingRight: '10em',
      // },
    }}
    {...props}
  />
);

export { HomepageContent };
