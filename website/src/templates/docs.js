/** @jsx jsx */

import { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Link, graphql } from 'gatsby';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import { MDXProvider } from '@mdx-js/react';
import { jsx } from '@emotion/core';
import { SkipNavContent } from '@reach/skip-nav';
import { borderRadius, colors, gridSize } from '@arch-ui/theme';
import slugify from '@sindresorhus/slugify';

import { Layout, Content } from '../templates/layout';
import mdComponents from '../components/markdown';
import { SiteMeta } from '../components/SiteMeta';
import { Container } from '../components';
import { Sidebar } from '../components/Sidebar';
import { media } from '../utils/media';
import { useNavData } from '../utils/hooks';
import { titleCase } from '../utils/case';

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

  const { body, fields, headings } = mdx;

  const { siteMetadata } = site;
  const suffix = fields.navGroup ? ` (${titleCase(fields.navGroup)})` : '';
  const title = `${
    fields.pageTitle.charAt(0) === '@' ? fields.heading : fields.pageTitle
  }${suffix}`;

  return (
    <Fragment>
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
        {({ sidebarIsVisible, toggleSidebar }) => (
          <Container hasGutters={false} css={{ display: 'flex' }}>
            <Sidebar isVisible={sidebarIsVisible} toggleSidebar={toggleSidebar} />
            <Content
              className="docSearch-content"
              css={{ alignItems: 'flex-start', display: 'flex', flex: 1 }}
            >
              <div css={{ flex: 1, minWidth: 0 }}>
                <SkipNavContent />
                <MDXProvider components={mdComponents}>
                  <MDXRenderer>{body}</MDXRenderer>
                </MDXProvider>
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
              </div>
              {/* Table of Contents */}
              <div
                css={{
                  display: 'none',
                  flexShrink: 0,
                  paddingLeft: gridSize * 4,
                  paddingRight: gridSize * 3,
                  position: 'sticky',
                  top: 92,
                  width: 240,

                  [media.sm]: { display: 'block' },
                }}
              >
                <h4
                  css={{
                    color: colors.N40,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    marginTop: 0,
                    textTransform: 'uppercase',
                  }}
                >
                  On this page
                </h4>
                <ul css={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {headings.map(h => (
                    <li
                      key={h.value}
                      css={{
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <a
                        css={{
                          color: colors.N80,
                          fontSize: '0.9rem',

                          ':hover': {
                            color: colors.N100,
                          },
                        }}
                        href={`#${slugify(h.value, { decamelize: false })}`}
                      >
                        {h.value}
                      </a>
                    </li>
                  ))}
                </ul>
                <EditSection>
                  {/* <p>
                    Have you found a mistake, something that is missing, or could be improved on
                    this page? Please edit the Markdown file on GitHub and submit a PR with your
                    changes.
                  </p> */}
                  <EditButton href={fields.editUrl} target="_blank">
                    <svg
                      fill="currentColor"
                      height="1.25em"
                      width="1.25em"
                      viewBox="0 0 40 40"
                      css={{ marginLeft: -(gridSize / 2), marginRight: '0.5em' }}
                    >
                      <path d="m34.5 11.7l-3 3.1-6.3-6.3 3.1-3q0.5-0.5 1.2-0.5t1.1 0.5l3.9 3.9q0.5 0.4 0.5 1.1t-0.5 1.2z m-29.5 17.1l18.4-18.5 6.3 6.3-18.4 18.4h-6.3v-6.2z" />
                    </svg>
                    Edit on GitHub
                  </EditButton>
                </EditSection>
              </div>
            </Content>
          </Container>
        )}
      </Layout>
    </Fragment>
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
      borderTop: `1px solid ${colors.N10}`,
      marginTop: '1.66rem',
      paddingTop: '1.66rem',
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
      headings(depth: h2) {
        value
      }
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
