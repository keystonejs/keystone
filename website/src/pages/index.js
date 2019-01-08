import React from 'react';
import { graphql, Link } from 'gatsby';

import Search from '../components/search';

export default ({ data }) => (
  <div>
    <Search />
    <h1>
      Hello{' '}
      <span role="img" aria-label="Waving hand">
        👋
      </span>
    </h1>
    <h2>
      Start here{' '}
      <span role="img" aria-label="hand pointing right">
        👉
      </span>{' '}
      <Link to="/docs">/docs</Link>
    </h2>
    {data.allSitePage.totalCount >= 1 ? (
      <div>
        <h2>Pages ({data.allSitePage.totalCount})</h2>
        <ul>
          {data.allSitePage.edges
            // Set up a particular order of results here:
            // - '/' always comes first
            // - '/docs' always comes next
            // - ... the rest of the results, ordered by 'path' by the query
            .sort((a, b) =>
              a.node.path === '/' ||
              (a.node.context.workspace !== b.node.context.workspace &&
                a.node.context.workspace === 'docs' &&
                b.node.path !== '/')
                ? -1
                : 0
            )
            .map(({ node }) => (
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
          context {
            workspace
          }
        }
      }
    }
  }
`;
