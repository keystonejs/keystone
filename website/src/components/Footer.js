import { jsx } from '@emotion/core';

import { colors } from '@voussoir/ui/src/theme';

/** @jsx jsx */

const Footer = () => (
  <footer
    css={{
      background: colors.B.A25,
      padding: 16,
      textAlign: 'center',
    }}
  >
    Made with love by <a href="https://www.thinkmill.com.au">Thinkmill</a> and our contributors.
  </footer>
);

export default Footer;
