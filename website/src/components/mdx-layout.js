// posts-page-layout.js
import React from 'react';
import { graphql } from 'gatsby';
import MDXRenderer from 'gatsby-mdx/mdx-renderer';

function PostPageTemplate(props) {
  return props.data ? <MDXRenderer>{props.data.mdx}</MDXRenderer> : props.children;
}

export default PostPageTemplate;
export const pageQuery = graphql`
  query($id: String!) {
    mdx(id: { eq: $id }) {
      id
      code {
        body
      }
    }
  }
`;
