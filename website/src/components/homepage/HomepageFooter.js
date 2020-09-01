/** @jsx jsx */

import { jsx } from '@emotion/core';
import { colors } from '@arch-ui/theme';
import GitHubButton from 'react-github-btn';

import { Container } from '../../components';

const HomepageFooter = () => (
  <footer
    css={{
      paddingTop: '4rem',
      paddingBottom: '4rem',
      textAlign: 'center',
    }}
  >
    <Container>
      <GitHubButton
        href="https://github.com/keystonejs/keystone"
        data-size="large"
        data-show-count="true"
        aria-label="Star keystonejs/keystone on GitHub"
      >
        Star
      </GitHubButton>
      <div css={{ marginTop: '2rem' }}>
        <p css={{ color: colors.N40 }}>
          Keystone is built by{' '}
          <a
            css={{ color: colors.N80 }}
            href="https://www.thinkmill.com.au"
            rel="noopener noreferrer"
            target="_blank"
          >
            Thinkmill
          </a>{' '}
          and{' '}
          <a
            css={{ color: colors.N80 }}
            href="https://github.com/keystonejs/keystone/blob/master/CONTRIBUTING.md#contributors"
            rel="noopener noreferrer"
            target="_blank"
          >
            Contributors
          </a>{' '}
          around the world.
        </p>
        <p css={{ color: colors.N40, fontSize: '0.875rem' }}>
          Keystone v4 has moved to{' '}
          <a
            css={{ color: colors.N80 }}
            href="https://v4.keystonejs.com/"
            rel="noopener noreferrer"
            target="_blank"
          >
            v4.keystonejs.com
          </a>
        </p>
      </div>
    </Container>
  </footer>
);

export { HomepageFooter };
