/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { jsx } from '@emotion/core';
import { colors } from '@arch-ui/theme';

import { Link } from 'gatsby';
import { H1, H2, H3, H4, H5, H6 } from './Heading';
import { Code } from './Code';
import { Table } from './Table';

const Hr = props => (
  <hr
    css={{
      backgroundColor: colors.N80,
      height: 3,
      border: 0,
      marginBottom: '3rem',
      marginTop: '3rem',
      marginLeft: 0,
      width: 120,
      position: 'relative',
    }}
    {...props}
  />
);
const Anchor = ({ href, ...props }) => {
  const styles = {
    borderBottom: `1px solid ${colors.B.A40}`,
    color: colors.N100,
    textDecoration: 'none',
    WebkitTapHighlightColor: 'transparent',

    ':hover, :focus': {
      backgroundColor: colors.B.A10,
      borderBottomColor: 'currentColor',
      textDecoration: 'none',
    },
  };

  if (!href || href.indexOf('http') === 0 || href.indexOf('#') === 0) {
    return <a href={href} css={styles} {...props} />;
  }
  return <Link to={href} css={styles} {...props} />;
};

export default {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  hr: Hr,
  code: Code,
  table: Table,
  a: Anchor,
};
