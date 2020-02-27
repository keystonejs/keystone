/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { Helmet } from 'react-helmet';
import { Link, graphql } from 'gatsby';
import { MDXRenderer } from 'gatsby-plugin-mdx';

import { MDXProvider } from '@mdx-js/react';
import { jsx } from '@emotion/core';
import { SkipNavContent } from '@reach/skip-nav';
import { borderRadius, colors, gridSize } from '@arch-ui/theme';

import Layout from '../templates/layout';
import mdComponents from '../components/markdown';
import { SiteMeta } from '../components/SiteMeta';
import { media, mediaMax } from '../utils/media';
import { useNavData } from '../utils/hooks';
import { Container } from '../components';
import { CONTAINER_GUTTERS } from '../components/Container';
import { Sidebar, SIDEBAR_WIDTH } from '../components/Sidebar';

function titleCase(str, at = '-') {
  if (!str) return str;

  const arr = str
    .toLowerCase()
    .split(at)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1));

  return arr.join(' ');
}

export default function Template({
  data: { mdx, site }, // this prop will be injected by the GraphQL query below.
  pageContext: { slug },
}) {
  let navData = useNavData();
  let flatNavData = navData.reduce((prev, next) => {
    const subNavData = next.subNavs.reduce((prev, next) => [...prev].concat(next.pages), []);
    return [...prev, ...next.pages, ...subNavData];
  }, []);
  let currentPageIndex = flatNavData.findIndex(node => node.path === slug);
  let prev, next;
  if (currentPageIndex !== 0) {
    prev = flatNavData[currentPageIndex - 1];
  }
  if (currentPageIndex !== flatNavData.length - 1) {
    next = flatNavData[currentPageIndex + 1];
  }

  const { body, fields } = mdx;
  const { siteMetadata } = site;
  const suffix = fields.navGroup ? ` (${titleCase(fields.navGroup)})` : '';
  const title = `${
    fields.pageTitle.charAt(0) === '@' ? fields.heading : fields.pageTitle
  }${suffix}`;

  return (
    <>
      <SiteMeta pathname={fields.slug} />
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={fields.description} />
        <meta property="og:description" content={fields.description} />
        <meta property="og:url" content={`${siteMetadata.siteUrl}${fields.slug}`} />
        <meta property="og:title" content={title} />
        <meta property="og:type" content="article" />
        <meta name="twitter:description" content={fields.description} />
      </Helmet>
      <Layout>
        {({ sidebarOffset, sidebarIsVisible }) => (
          <Container>
            <Sidebar isVisible={sidebarIsVisible} offsetTop={sidebarOffset} />
            <Content>
              <main>
                <SkipNavContent />
                <MDXProvider components={mdComponents}>
                  <MDXRenderer>{body}</MDXRenderer>
                </MDXProvider>
              </main>
              <EditSection>
                <p>
                  Have you found a mistake, something that is missing, or could be improved on this
                  page? Please edit the Markdown file on GitHub and submit a PR with your changes.
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
              <Pagination aria-label="Pagination">
                {prev ? (
                  <PaginationButton to={prev.path}>
                    <small>&larr; Prev</small>
                    <span>{prev.context.pageTitle}</span>
                  </PaginationButton>
                ) : (
                  <PaginationPlaceholder />
                )}
                {next ? (
                  <PaginationButton align="right" to={next.path}>
                    <small>Next &rarr;</small>
                    <span>{next.context.pageTitle}</span>
                  </PaginationButton>
                ) : (
                  <PaginationPlaceholder />
                )}
              </Pagination>
            </Content>
          </Container>
        )}
      </Layout>
    </>
  );
}

// ==============================
// Meta
// ==============================

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

const Pagination = props => (
  <nav
    css={{
      display: 'flex',
      marginLeft: -gutter,
      marginRight: -gutter,
      marginTop: '3rem',
    }}
    {...props}
  />
);
const PaginationPlaceholder = props => <div css={{ flex: 1 }} {...props} />;
const PaginationButton = ({ align = 'left', ...props }) => (
  <Button
    as={Link}
    css={{
      flex: 1,
      lineHeight: 1.4,
      marginLeft: gutter,
      marginRight: gutter,
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
        whiteSpace: 'nowrap',
      },
    }}
    {...props}
  />
);

// ==============================
// Layout
// ==============================

const layoutGutter = gridSize * 4;

const Content = props => (
  <div
    css={{
      minWidth: 0,
      lineHeight: '1.6',
      paddingBottom: '3rem',
      paddingTop: layoutGutter,

      [media.sm]: {
        marginLeft: SIDEBAR_WIDTH,
        paddingLeft: layoutGutter,
      },

      // TODO: doesn't play nice with "gatsby-resp-image-wrapper"
      img: {
        backgroundColor: 'white',
        borderRadius,
        boxSizing: 'border-box',
        boxShadow: '0 0 0 1px hsla(0, 0%, 0%, 0.1), 0 4px 11px hsla(0, 0%, 0%, 0.1) !important',
        display: 'block',
        marginBottom: '2rem',
        marginTop: '2rem',
        maxWidth: '100%',
      },

      // NOTE: consider removing `gatsby-resp-image-wrapper`
      '.gatsby-resp-image-link, .gatsby-resp-image-link:hover, .gatsby-resp-image-link:focus': {
        background: 0,
        border: 0,
        marginBottom: '2rem',
        marginTop: '2rem',
      },

      // Misc. Typography
      // ------------------------------
      ul: {
        lineHeight: 1.8,
      },
      'ul > li > ul, ol > li > ol, ul > li > ol, ol > li > ul': {
        paddingLeft: '1.33rem',
      },
      blockquote: {
        fontSize: '1.25rem',
        fontStyle: 'italic',
        color: colors.N60,
        margin: `3rem 0`,
        padding: 0,
        paddingLeft: '3rem',
        position: 'relative',
      },

      // Code
      // ------------------------------

      code: {
        fontFamily: 'Consolas, Menlo, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
        fontSize: '0.85em',
        fontWeight: 'normal',
      },
      pre: {
        backgroundColor: 'rgba(9, 30, 66, 0.03)',
        boxShadow: '-4px 0 0 rgba(9, 30, 66, 0.09)',
        boxSizing: 'border-box',
        fontFamily: 'Consolas,Menlo,Monaco,"Andale Mono","Ubuntu Mono",monospace',
        lineHeight: '1.2',
        padding: gridSize * 2,
        overflowX: 'auto',
        tabSize: 2,
        WebkitOverflowScrolling: 'touch',

        // our snippets seem to have an extra line...
        '.token-line:last-of-type': {
          display: 'none',
        },

        [mediaMax.sm]: {
          marginLeft: -CONTAINER_GUTTERS[0],
          marginRight: -CONTAINER_GUTTERS[0],
        },
      },

      '& :not(pre) > code': {
        backgroundColor: 'rgba(255, 227, 128,0.2)',
        borderRadius: 2,
        color: colors.N100,
        margin: 0,
        padding: '0.2em 0.4em',
      },

      '& h1 > code, & h2 > code, & h3 > code, & h4 > code, & h5 > code, & h6 > code': {
        backgroundColor: 'rgba(255, 235, 229, 0.6)',
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
      body
      fields {
        heading
        description
        editUrl
        pageTitle
        navGroup
        slug
      }
    }
    site {
      siteMetadata {
        siteUrl
      }
    }
  }
`;
