import React from 'react';
import { StaticQuery, graphql, Link } from 'gatsby';

import { jsx } from '@emotion/core';

import { colors } from '../styles';

// @jsx jsx

export default () => (
  <StaticQuery
    query={graphql`
      query HeadingQuery {
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
    `}
    render={data => (
      <>
        {data.allSitePage.totalCount >= 1 ? (
          <div>
            <ul>
              {data.allSitePage.edges
                // Set up a particular order of results here:
                // - '/' always comes first
                // - '/docs' always comes next
                // - ... the rest of the results, ordered by 'path' by the query
                .sort(
                  (a, b) =>
                    a.node.path === '/' ||
                    (a.node.context.workspace !== b.node.context.workspace &&
                      a.node.context.workspace === 'docs' &&
                      b.node.path !== '/')
                      ? -1
                      : 0
                )
                .map(({ node }) => {
                  console.log(node);
                  return (
                    <li key={node.path}>
                      <Link to={node.path}>{node.path}</Link>
                    </li>
                  );
                })}
            </ul>
          </div>
        ) : (
          <div>No pages yet</div>
        )}
      </>
    )}
  />
);
