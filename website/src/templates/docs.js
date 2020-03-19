/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { Helmet } from 'react-helmet';
import { Link, graphql } from 'gatsby';
import { MDXRenderer } from 'gatsby-plugin-mdx';

import { MDXProvider } from '@mdx-js/react';
import { jsx } from '@emotion/core';
import { SkipNavContent } from '@reach/skip-nav';
import { borderRadius, colors, gridSize } from '@arch-ui/theme';

import { Layout, Content } from '../templates/layout';
import mdComponents from '../components/markdown';
import { SiteMeta } from '../components/SiteMeta';
import { mediaMax } from '../utils/media';
import { useNavData } from '../utils/hooks';
import { titleCase } from '../utils/case';
import { Container } from '../components';
import { Sidebar } from '../components/Sidebar';

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
            <Content className="docSearch-content">
              <SkipNavContent />
              <MDXProvider components={mdComponents}>
                <MDXRenderer>{body}</MDXRenderer>
              </MDXProvider>
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
