import React from 'react';
import { graphql, Link } from 'gatsby';

import { jsx, Global } from '@emotion/core';

import { colors } from '../styles';

import Layout from '../templates/layout';

/* @jsx jsx */

export default function Template({
  data, // this prop will be injected by the GraphQL query below.
  pathContext: { workspace, workspaceSlug },
}) {
  const { markdownRemark } = data; // data.markdownRemark holds our post data
  const { html } = markdownRemark;
  return (
    <Layout>
      <div id="primary">
        <Link to="/">Voussoir</Link> &gt;{' '}
        <Link to={workspaceSlug}>
          <code>{workspace}</code>
        </Link>
        <div className="blog-post">
          <div className="blog-post-content" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </Layout>
  );
}

/*
To my chagrin and fury, context is spread on to the available query options.
*/
export const pageQuery = graphql`
  query($mdPageId: String!) {
    markdownRemark(id: { eq: $mdPageId }) {
      html
    }
  }
`;
