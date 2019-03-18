/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { jsx } from '@emotion/core';
import { colors } from '@arch-ui/theme';

const Anchor = props => <a css={{ color: colors.N60, textDecoration: 'none' }} {...props} />;

export const Footer = () => (
  <footer
    css={{
      backgroundColor: 'white',
      borderRadius: 3,
      boxShadow: '0 0 0 1px rgba(9, 30, 66, 0.09)',
      color: colors.N40,
      fontSize: '0.75rem',
      marginTop: '3rem',
      paddingBottom: '1em',
      paddingTop: '1em',
      textAlign: 'center',
    }}
  >
    Made with ❤️ by{' '}
    <Anchor href="https://www.thinkmill.com.au" target="_blank">
      Thinkmill
    </Anchor>{' '}
    and
    <br />
    amazing{' '}
    <Anchor href="https://github.com/keystonejs/keystone-5/graphs/contributors" target="_blank">
      contributors
    </Anchor>
  </footer>
);
