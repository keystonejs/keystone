/** @jsx jsx */

import React, { Fragment } from 'react'; // eslint-disable-line no-unused-vars
import { Helmet } from 'react-helmet';
import { graphql } from 'gatsby';
import { MDXRenderer } from 'gatsby-plugin-mdx';

import { MDXProvider } from '@mdx-js/react';
import { jsx } from '@emotion/core';
import { SkipNavContent } from '@reach/skip-nav';

import { Layout, Content } from '../templates/layout';
import mdComponents from '../components/markdown';
import { SiteMeta } from '../components/SiteMeta';
import { useNavData } from '../utils/hooks';
import { titleCase } from '../utils/case';
import { Container } from '../components';
import { Sidebar } from '../components/Sidebar';

export default function Template({
  data: { mdx, site }, // this prop will be injected by the GraphQL query below.
}) {
  let navData = useNavData();

  const { body, fields } = mdx;
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
              <SkipNavContent />
              <MDXProvider components={mdComponents}>
                <MDXRenderer>{body}</MDXRenderer>
              </MDXProvider>
              {renderNavSection(fields.navGroup)}
            </Content>
          </Container>
        )}
      </Layout>
    </>
  );
}

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
