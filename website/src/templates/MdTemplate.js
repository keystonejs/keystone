import { graphql, Link } from 'gatsby';
import MDXRenderer from 'gatsby-mdx/mdx-renderer';
import { MDXProvider } from '@mdx-js/tag';

import { jsx } from '@emotion/core';

import { colors } from '../styles';

import Layout from '../templates/layout';

/** @jsx jsx */

const linkStyles = {
  textDecoration: 'none',
  color: colors.B.base,

  '&:hover': {
    color: colors.B.D80,
    textDecoration: 'underline',
  },
};

import mdComponents from '../components/markdown';

export default function Template({
  data, // this prop will be injected by the GraphQL query below.
  pageContext: { workspace, workspaceSlug },
}) {
  const { mdx } = data; // data.mdx holds our post data
  const { code, fields } = mdx;
  return (
    <Layout>
      <div id="primary" className="blog-post-container">
        <div css={{ color: colors.B.A50, textTransform: 'capitalize' }}>
          <Link css={linkStyles} to="/">
            Keystone
          </Link>{' '}
          &gt;{' '}
          <Link css={linkStyles} to={workspaceSlug}>
            {workspace}
          </Link>
          <a href={fields.editUrl}>Edit on github</a>
        </div>
        <div className="blog-post">
          <MDXProvider components={mdComponents}>
            <MDXRenderer>{code.body}</MDXRenderer>
          </MDXProvider>
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
