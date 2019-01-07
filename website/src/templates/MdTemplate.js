import React from 'react';
import { graphql, Link } from 'gatsby';
import MDXRenderer from 'gatsby-mdx/mdx-renderer';
import { MDXProvider } from '@mdx-js/tag';

import Search from '../components/search';
import Heading from '../components/markdown/Heading';
import Code from '../components/markdown/Code';

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
          <MDXProvider
            components={{
              h1: props => <Heading {...props} tag="h1" />,
              h2: props => <Heading {...props} tag="h2" />,
              h3: props => <Heading {...props} tag="h3" />,
              h4: props => <Heading {...props} tag="h4" />,
              h5: props => <Heading {...props} tag="h5" />,
              h6: props => <Heading {...props} tag="h6" />,
              code: Code,
            }}
          >
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
