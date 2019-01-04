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
    render={data => {
      const navData = data.allSitePage.edges.reduce((pageList, { node }) => {
        // finding out what directory the file is in (eg '/voussoir')

        if (node.context.workspace != null && !node.path.includes('changelog')) {
          let dir = node.context.workspace;

          if (!pageList[dir]) {
            pageList[dir] = [];
          }
          pageList[dir].push(node);
        }

        return pageList;
      }, {});

      const keys = Object.keys(navData).sort(x => {
        return x.startsWith('@') ? 0 : -1;
      });

      const prettyName = node => {
        let pretty = node.path
          .replace(node.context.workspace.replace('@', ''), '')
          .replace(new RegExp(/(\/)/g), ' ')
          .replace('-', ' ')
          .trim();

        if (pretty.startsWith('packages') || pretty.startsWith('types')) {
          pretty = pretty.replace('packages', '').replace('types', '');
        }

        return pretty == '' ? 'index' : pretty;
      };

      return (
        <>
          {data.allSitePage.totalCount >= 1 ? (
            <div>
              {keys.map(key => {
                return (
                  <div>
                    <span
                      css={{
                        fontSize: '1.5em',
                        fontWeight: 700,
                        textTransform: 'capitalize',
                      }}
                    >
                      {key}
                    </span>
                    <ul
                      css={{
                        listStyle: 'none',
                        padding: 0,
                        margin: '0 0 32px 0',
                      }}
                    >
                      {navData[key].map(node => {
                        return (
                          <li
                            key={node.path}
                            css={{
                              padding: 10,
                              borderBottom: `1px solid ${colors.B.A15}`,
                            }}
                          >
                            <Link
                              css={{
                                textDecoration: 'none',
                                color: colors.B.text,
                                textTransform: 'capitalize',

                                '&:hover': {
                                  color: colors.B.base,
                                },

                                '&[aria-current="page"]': {
                                  color: colors.B.base,
                                  textDecoration: 'underline',
                                },
                              }}
                              to={node.path}
                            >
                              {prettyName(node)}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          ) : (
            <div>No pages yet</div>
          )}
        </>
      );
    }}
  />
);
