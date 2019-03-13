/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { jsx } from '@emotion/core';
import { colors } from '@arch-ui/theme';

import { Link } from 'gatsby';
import { H1, H2, H3, H4, H5, H6 } from './Heading';
import Code from './Code';
// import Code from './Pre';

const Hr = props => (
  <hr
    css={{
      backgroundColor: colors.N80,
      height: 3,
      border: 0,
      margin: '2em auto',
      width: 120,
      position: 'relative',
    }}
    {...props}
  />
);

export default {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  hr: Hr,
  code: Code,
  a: ({ href, ...props }) => {
    if (!href || href.indexOf('http') === 0 || href.indexOf('#') === 0) {
      return <a href={href} {...props} />;
    }
    return <Link to={href} {...props} />;
  },
};
