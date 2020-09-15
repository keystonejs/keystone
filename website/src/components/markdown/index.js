/** @jsx jsx */

import { Fragment } from 'react';
import { jsx } from '@emotion/core';
import { colors } from '@arch-ui/theme';

import { Link } from 'gatsby';
import { H1, H2, H3, H4, H5, H6 } from './Heading';
import { Blockquote } from './Blockquote';
import { InlineCode, CodeBlock } from './Code';
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

  if (
    !href ||
    href.indexOf('http') === 0 ||
    href.indexOf('#') === 0 ||
    // we want to use a normal anchor for anything on /static/ because
    // it will be an image or something like that
    href.indexOf('/static/') === 0
  ) {
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
  blockquote: Blockquote,
  p: Paragraph,
  pre: ({ children }) => <Fragment>{children}</Fragment>, // The `CodeBlock` component handles pre-wrapping
  code: CodeBlock,
  inlineCode: InlineCode,
  table: Table,
  a: Anchor,
};

// NOTE: filter out paragraphs that contain badges
// ------------------------------
// we're following a golden path here that assumes A LOT
// the pattern we're expecting is `p > a > img` -- React's single child quirk lets us chain
// i know it's super brittle, but will tidy things up for the moment
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function hasBadge(props) {
  return props?.children?.props?.children?.props?.src?.includes('shields.io');
}

function Paragraph(props) {
  if (hasBadge(props)) {
    return null;
  }

  return <p {...props} />;
}
