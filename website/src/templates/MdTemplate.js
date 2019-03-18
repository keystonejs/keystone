/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { Link, graphql } from 'gatsby';
import MDXRenderer from 'gatsby-mdx/mdx-renderer';
import { MDXProvider } from '@mdx-js/tag';
import { jsx } from '@emotion/core';
import { borderRadius, colors, gridSize } from '@arch-ui/theme';

import Layout from '../templates/layout';
import mdComponents from '../components/markdown';
import { media } from '../utils/media';

export default function Template({
  data, // this prop will be injected by the GraphQL query below.
  pageContext: { prev, next },
}) {
  const { mdx } = data; // data.mdx holds our post data
  const { code, fields } = mdx;

  return (
    <Layout>
      {/*
        NOTE: our content hierarchy isn't deep enough (one level) to need breadcrumbs.
        Might need it later?
      */}
      {/* <div css={{ color: colors.B.A50, textTransform: 'capitalize' }}>
          <StyledLink to="/">Keystone</StyledLink> &gt;{' '}
          <StyledLink to={workspaceSlug}>{workspace}</StyledLink>
        </div> */}
      <MDXProvider components={mdComponents}>
        <MDXRenderer>{code.body}</MDXRenderer>
      </MDXProvider>
      <EditSection>
        <p>
          Have you found a mistake, something that is missing, or could be improved on this page?
          Please edit the Markdown file on GitHub and submit a PR with your changes.
        </p>
        <EditButton href={fields.editUrl} target="_blank" title="Edit this page on GitHub">
          Edit Page
        </EditButton>
      </EditSection>
      <NavWrapper>
        {prev ? (
          <NavButton to={prev.fields.slug}>
            <small>Prev</small>
            <span>{prev.fields.pageTitle.replace('-', ' ')}</span>
          </NavButton>
        ) : (
          <NavPlaceholder />
        )}
        {next ? (
          <NavButton to={next.fields.slug}>
            <small>Next</small>
            <span>{next.fields.pageTitle.replace('-', ' ')}</span>
          </NavButton>
        ) : (
          <NavPlaceholder />
        )}
      </NavWrapper>
    </Layout>
  );
}

// ==============================
// Styled Components
// ==============================

const Button = ({ as: Tag, ...props }) => (
  <Tag
    css={{
      border: `1px solid rgba(0, 0, 0, 0.1)`,
      borderBottomColor: `rgba(0, 0, 0, 0.2) !important`,
      borderRadius: borderRadius,
      color: colors.text,
      display: 'inline-block',
      fontWeight: 500,
      padding: `${gridSize * 0.75}px ${gridSize * 2}px`,
      outline: 'none',

      ':hover, :focus': {
        backgroundColor: 'white !important',
        borderColor: `rgba(0, 0, 0, 0.15)`,
        boxShadow: '0 2px 1px rgba(0,0,0,0.05)',
        textDecoration: 'none',
      },
      ':active': {
        backgroundColor: `${colors.N05} !important`,
        boxShadow: 'none',
      },
    }}
    {...props}
  />
);

// Edit
// ------------------------------

const EditSection = props => (
  <section
    css={{
      borderBottom: `1px solid ${colors.N10}`,
      borderTop: `1px solid ${colors.N10}`,
      marginBottom: '3rem',
      marginTop: '3rem',
      paddingBottom: '3rem',
      paddingTop: '3rem',

      p: {
        marginTop: 0,
      },

      [media.sm]: {
        display: 'none',
      },
    }}
    {...props}
  />
);
const EditButton = props => <Button as="a" css={{ fontSize: '0.85rem' }} {...props} />;

// Previous / Next Navigation
// ------------------------------
const gutter = gridSize / 2;

const NavWrapper = props => (
  <div
    css={{
      display: 'flex',
      marginLeft: -gutter,
      marginRight: -gutter,
      marginTop: '3rem',
    }}
    {...props}
  />
);
const NavPlaceholder = props => <div css={{ flex: 1 }} {...props} />;
const NavButton = props => (
  <Button
    as={Link}
    css={{
      flex: 1,
      lineHeight: 1.4,
      marginLeft: gutter,
      marginRight: gutter,
      textTransform: 'capitalize',

      small: {
        color: colors.N60,
        display: 'block',
        fontSize: '0.85rem',
        marginTop: gutter,
      },
      span: {
        display: 'block',
        fontSize: '1.25rem',
        marginBottom: gutter,
      },
    }}
    {...props}
  />
);

// ==============================
// Query
// ==============================

// To my chagrin and fury, context is spread on to the available query options.
export const pageQuery = graphql`
  query($mdPageId: String!) {
    mdx(id: { eq: $mdPageId }) {
      code {
        body
      }
      fields {
        editUrl
      }
    }
  }
`;
