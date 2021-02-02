/** @jsx jsx */

import { jsx } from '@emotion/core';

const bannerStyles = {
  textAlign: 'center',
  background: '#FFFBEB',
  borderBottom: '1px solid #FEF3C7',
  display: 'block',
  padding: 12,
  color: 'black',

  ':hover': {
    textDecoration: 'none',

    background: '#FEF3C7',
    borderBottom: '1px solid #FDE68A',
  },
};

const codeStyles = {
  fontSize: '90%',
  padding: 4,
  fontWeight: 'bold',
};

export const NextBanner = () => (
  <div>
    <a css={bannerStyles} href="https://next.keystonejs.com">
      👋🏻{' '}
      <span>
        We're working on the next generation of KeystoneJS! If you're using the{' '}
        <code css={codeStyles}>@keystone-next</code> packages, click here to learn more
      </span>
    </a>
  </div>
);
