import React from 'react';
import { graphql, Link } from 'gatsby';
import MDXRenderer from 'gatsby-mdx/mdx-renderer';
import { MDXProvider } from '@mdx-js/tag';

import Search from '../components/search';
import mdComponents from '../components/markdown';

export default function Template({
  data, // this prop will be injected by the GraphQL query below.
  pageContext: { workspace, workspaceSlug },
}) {
  const { mdx } = data; // data.mdx holds our post data
  const { code, fields } = mdx;
  return (
    <div className="blog-post-container">
      <Search />
      <Link to="/">Voussoir</Link> &gt;{' '}
      <Link to={workspaceSlug}>
        <code>{workspace}</code>
      </Link>{' '}
      <a href={fields.editUrl}>Edit on github</a>
      <div className="blog-post">
        <div className="blog-post-content">
          <MDXProvider components={mdComponents}>
            <MDXRenderer>{code.body}</MDXRenderer>
          </MDXProvider>
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
