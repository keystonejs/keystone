/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { Link, graphql } from 'gatsby';
import MDXRenderer from 'gatsby-mdx/mdx-renderer';
import { MDXProvider } from '@mdx-js/tag';
import { jsx } from '@emotion/core';
import { borderRadius, colors, gridSize } from '@arch-ui/theme';

import Layout from '../templates/layout';
import mdComponents from '../components/markdown';
import { mediaMax } from '../utils/media';

export default function Template({
  data, // this prop will be injected by the GraphQL query below.
  pageContext: { prev, next },
}) {
  const { mdx } = data; // data.mdx holds our post data
  const { code, fields } = mdx;

  return (
    <Layout>
      <MDXProvider components={mdComponents}>
        <MDXRenderer>{code.body}</MDXRenderer>
      </MDXProvider>
      <EditSection>
        <p>
          Have you found a mistake, something that is missing, or could be improved on this page?
          Please edit the Markdown file on GitHub and submit a PR with your changes.
        </p>
        <EditButton href={fields.editUrl} target="_blank" title="Edit this page on GitHub">
          <svg
            fill="currentColor"
            height="1.25em"
            width="1.25em"
            viewBox="0 0 40 40"
            css={{ marginLeft: -(gridSize / 2), marginRight: '0.5em' }}
          >
            <path d="m34.5 11.7l-3 3.1-6.3-6.3 3.1-3q0.5-0.5 1.2-0.5t1.1 0.5l3.9 3.9q0.5 0.4 0.5 1.1t-0.5 1.2z m-29.5 17.1l18.4-18.5 6.3 6.3-18.4 18.4h-6.3v-6.2z" />
          </svg>
          Edit Page
        </EditButton>
      </EditSection>
      <NavWrapper>
        {prev ? (
          <NavButton to={prev.fields.slug}>
            <small>&larr; Prev</small>
            <span>{prev.fields.pageTitle.replace('-', ' ')}</span>
          </NavButton>
        ) : (
          <NavPlaceholder />
        )}
        {next ? (
          <NavButton align="right" to={next.fields.slug}>
            <small>Next &rarr;</small>
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

      [mediaMax.sm]: {
        display: 'none',
      },
    }}
    {...props}
  />
);
const EditButton = props => (
  <Button
    as="a"
    css={{
      alignItems: 'center',
      display: 'inline-flex',
      fontSize: '0.85rem',
    }}
    {...props}
  />
);

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
const NavButton = ({ align = 'left', ...props }) => (
  <Button
    as={Link}
    css={{
      flex: 1,
      lineHeight: 1.4,
      marginLeft: gutter,
      marginRight: gutter,
      textTransform: 'capitalize',
      textAlign: align,

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
