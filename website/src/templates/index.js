/** @jsx jsx */

import React, { Fragment } from 'react'; // eslint-disable-line no-unused-vars
import { Helmet } from 'react-helmet';
import { graphql } from 'gatsby';
import MDXRenderer from 'gatsby-mdx/mdx-renderer';

import { MDXProvider } from '@mdx-js/react';
import { jsx } from '@emotion/core';
import { SkipNavContent } from '@reach/skip-nav';
import { borderRadius, colors, gridSize } from '@arch-ui/theme';

import Layout from './layout';
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
}) {
  let navData = useNavData();

  const { code, fields } = mdx;
  const { siteMetadata } = site;
  const suffix = fields.navGroup ? ` (${titleCase(fields.navGroup)})` : '';
  const title = `${
    fields.pageTitle.charAt(0) === '@' ? fields.heading : fields.pageTitle
  }${suffix}`;

  const renderNavSection = section => {
    const navSectionData = navData.find(d => d.navTitle === section);
    if (navSectionData) {
      return (
        <Fragment>
          <ul>
            {navSectionData.pages
              .filter(d => d.path !== fields.slug)
              .map(d => (
                <li key={d.path}>
                  <a href={d.path}>{d.context.pageTitle}</a>
                </li>
              ))}
          </ul>
          {navSectionData.subNavs.length
            ? navSectionData.subNavs.map((d, i) => (
                <Fragment key={`subnavdata-${i}`}>
                  <h2>{d.navTitle.replace('-', ' ').toUpperCase()}</h2>
                  <ul>
                    {d.pages.map(d => (
                      <li key={d.path}>{<a href={d.path}>{d.context.pageTitle}</a>}</li>
                    ))}
                  </ul>
                </Fragment>
              ))
            : null}
        </Fragment>
      );
    }
    return null;
  };

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
                  <MDXRenderer>{code.body}</MDXRenderer>
                </MDXProvider>
                {renderNavSection(fields.navGroup)}
              </main>
            </Content>
          </Container>
        )}
      </Layout>
    </>
  );
}

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
      rawBody
      code {
        body
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
