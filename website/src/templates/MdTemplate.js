import React from 'react';
import { graphql, Link } from 'gatsby';

import { jsx, Global } from '@emotion/core';

import { colors } from '../styles';

import Header from '../components/Header';
import Footer from '../components/Footer';
//import Sidebar from '../components/Sidebar';

/* @jsx jsx */

export default function Template({
  data, // this prop will be injected by the GraphQL query below.
  pathContext: { workspace, workspaceSlug },
}) {
  const { markdownRemark } = data; // data.markdownRemark holds our post data
  const { html } = markdownRemark;
  return (
    <div className="blog-post-container">
      <Global
        styles={{
          body: {
            margin: 0,
            color: colors.B.D55,
            fontFamily: 'system-ui, BlinkMacSystemFont, -apple-system, Segoe UI, Roboto,sans-serif',
          },
          '*': { boxSizing: 'border-box' },
        }}
      />
      <Header />
      <div css={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* <Sidebar data={pageQuery} /> */}
        <div id="primary" css={{ padding: '32px' }}>
          <Link to="/">Voussoir</Link> &gt;{' '}
          <Link to={workspaceSlug}>
            <code>{workspace}</code>
          </Link>
          <div className="blog-post">
            <div className="blog-post-content" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </div>
    </div>
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
