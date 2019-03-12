/** @jsx jsx */

import { graphql } from 'gatsby';
import MDXRenderer from 'gatsby-mdx/mdx-renderer';
import { MDXProvider } from '@mdx-js/tag';
import { jsx } from '@emotion/core';
import { borderRadius, colors, gridSize } from '@arch-ui/theme';

import Layout from '../templates/layout';
import mdComponents from '../components/markdown';

const EditButton = props => (
  <a
    css={{
      backgroundColor: colors.N10,
      borderRadius: borderRadius,
      color: colors.N60,
      display: 'block',
      float: 'right',
      fontSize: '0.85rem',
      fontWeight: 500,
      padding: `${gridSize}px ${gridSize * 2}px`,
      outline: 'none',

      ':hover, :focus': {
        backgroundColor: colors.N15,
        textDecoration: 'none',
      },
      ':active': {
        backgroundColor: colors.N20,
      },
    }}
    {...props}
  />
);

export default function Template({
  data, // this prop will be injected by the GraphQL query below.
  // pageContext: { workspace, workspaceSlug },
}) {
  const { mdx } = data; // data.mdx holds our post data
  const { code, fields } = mdx;
  return (
    <Layout>
      {/*
          NOTE: our content hierarchy isn't deep enough (one level) to need breadcrumbs.
          Might need it later?
        */}
      {/* <div css={{ color: colors.B.A50, textTransform: 'capitalize' }}>
          <StyledLink to="/">Keystone</StyledLink> &gt;{' '}
          <StyledLink to={workspaceSlug}>{workspace}</StyledLink>
        </div> */}
      <EditButton href={fields.editUrl} target="_blank">
        Edit on Github
      </EditButton>
      <MDXProvider components={mdComponents}>
        <MDXRenderer>{code.body}</MDXRenderer>
      </MDXProvider>
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
