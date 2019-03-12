/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { jsx } from '@emotion/core';
import { colors } from '@arch-ui/theme';

const Anchor = props => <a css={{ color: colors.N60, textDecoration: 'none' }} {...props} />;

export const Footer = () => (
  <footer
    css={{
      color: colors.N40,
      fontSize: '0.75rem',
      textAlign: 'center',
    }}
  >
    Made with ❤️ by{' '}
    <Anchor href="https://www.thinkmill.com.au" target="_blank">
      Thinkmill
    </Anchor>
    <br />
    and our{' '}
    <Anchor href="https://github.com/keystonejs/keystone-5/graphs/contributors" target="_blank">
      contributors.
    </Anchor>
  </footer>
);
