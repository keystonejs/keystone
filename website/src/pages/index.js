import React from 'react';
import { graphql, Link } from 'gatsby';

export default ({ data }) => (
  <div>
    <h1>
      Hello{' '}
      <span role="img" aria-label="Waving hand">
        👋
      </span>
    </h1>
    {data.allSitePage.totalCount >= 1 ? (
      <div>
        <h2>Pages ({data.allSitePage.totalCount})</h2>
        <ul>
          {data.allSitePage.edges.map(({ node }) => (
            <li key={node.path}>
              <Link to={node.path}>{node.path}</Link>
            </li>
          ))}
        </ul>
      </div>
    ) : (
      <div>No pages yet</div>
    )}
  </div>
);

export const pageQuery = graphql`
  query Index {
    allSitePage(filter: { path: { ne: "/dev-404-page/" } }, sort: { fields: [path] }) {
      totalCount
      edges {
        node {
          path
        }
      }
    }
  }
`;
