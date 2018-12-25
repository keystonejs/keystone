import React from 'react';
import { jsx, css } from '@emotion/core';

import { colors } from '../styles';

// @jsx jsx

const Footer = () => (
  <footer
    css={{
      background: colors.B.A25,
      padding: 16,
      textAlign: 'center',
    }}
  >
    Made with love in Thinkmill
  </footer>
);

export default Footer;
