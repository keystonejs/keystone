/** @jsx jsx */

import React, { useMemo } from 'react'; // eslint-disable-line no-unused-vars
import { Helmet } from 'react-helmet';
import { graphql } from 'gatsby';
import { MDXRenderer } from 'gatsby-plugin-mdx';

import { MDXProvider } from '@mdx-js/react';
import { jsx } from '@emotion/core';
import { SkipNavContent } from '@reach/skip-nav';

import { Layout, Content } from './layout';
import mdComponents from '../components/markdown';
import { SiteMeta } from '../components/SiteMeta';
import { useNavData } from '../utils/hooks';
import { titleCase } from '../utils/case';
import { Container } from '../components';
import { Sidebar } from '../components/Sidebar';

export default function Template({
  data: { mdx, site }, // this prop will be injected by the GraphQL query below.
}) {
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
              <SkipNavContent />
              <MDXProvider components={mdComponents}>
                <MDXRenderer>{body}</MDXRenderer>
              </MDXProvider>
              <PackagesList />
            </Content>
          </Container>
        )}
      </Layout>
    </>
  );
}

const PackagesList = () => {
  const navData = useNavData();

  const sections = useMemo(() => {
    return navData.reduce((accum, navGroup) => {
      const pages = navGroup.pages
        .filter(page => page.context.isPackageIndex)
        .map(page => page.path);

      if (pages.length) {
        accum.push({
          title: navGroup.navTitle,
          items: pages,
        });
      }

      navGroup.subNavs.forEach(subNav => {
        const items = subNav.pages
          .filter(page => page.path.startsWith('/keystonejs/'))
          .filter(d => d.context.isPackageIndex)
          .map(page => page.path);

        if (items.length) {
          accum.push({
            title: subNav.navTitle,
            items,
          });
        }
      });

      return accum;
    }, []);
  }, [navData]);

  return sections.map((d, i) => (
    <section key={i}>
      <h2 css={{ textTransform: 'uppercase' }}>{d.title.replace('-', ' ')}</h2>
      <ul>
        {d.items.map(itemPath => (
          <li key={itemPath}>
            <a href={itemPath}>{itemPath.replace(/^\//, '@').replace(/\/$/, '')}</a>
          </li>
        ))}
      </ul>
    </section>
  ));
};

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
