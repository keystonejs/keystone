import React from 'react';
import { Link } from 'gatsby';

import { jsx } from '@emotion/core';

import { colors } from '../styles';

// @jsx jsx

const Sidebar = ({ data }) => (
  <div css={{ background: colors.B.A10, maxWidth: 300 }}>
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

export default Sidebar;
