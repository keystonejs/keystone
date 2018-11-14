import React from 'react';
import { graphql } from 'gatsby';

import rehypeReact from 'rehype-react';
import { Alert } from '../../../packages/alert';
import { CheckIcon } from '../../../packages/icons';
import Layout from '../layouts';

const renderAst = new rehypeReact({
  createElement: React.createElement,
  components: { alert: Alert, checkicon: CheckIcon },
}).Compiler;

export default ({ data }) => {
  const post = data.markdownRemark;
  return (
    <Layout>
      <div>
        <h1>{post.frontmatter.title}</h1>
        <div>{renderAst(post.htmlAst)}</div>
      </div>
    </Layout>
  );
};

export const query = graphql`
  query DocQuery($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      htmlAst
      frontmatter {
        title
      }
    }
  }
`;
