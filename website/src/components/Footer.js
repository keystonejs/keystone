import { jsx } from '@emotion/core';

import { colors } from '@arch-ui/theme';

/** @jsx jsx */

const Footer = ({ textCenter }) => (
  <footer
    css={[
      !textCenter && {
        borderTop: `1px solid ${colors.B.A25}`,
        padding: 24,
      },
      textCenter && { textAlign: 'center' },
    ]}
  >
    Made with ❤️ by{' '}
    <a href="https://www.thinkmill.com.au" css={{ color: colors.primary, textDecoration: 'none' }}>
      Thinkmill
    </a>{' '}
    and our contributors.
  </footer>
);

export default Footer;
