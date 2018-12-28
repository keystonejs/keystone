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
      const newData = data.allSitePage.edges.reduce(function(result, { node }) {
        //  /dir/thing
        const match = node.path.match(new RegExp(/\/[A-Za-z-]+\//g));

        if (match != null) {
          const dir = match[0].replace(new RegExp(/[\/]/g), '');

          if (!result[dir]) {
            result[dir] = [];
          }

          // node.path = node.path.replace(`/${dir}`, '');

          result[dir].push(node);
        }

        return result;
      }, {});

      const keys = Object.keys(newData).sort((x, y) => {
        return x == 'docs' ? -1 : 0;
      });

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
                      {newData[key].map(node => {
                        return (
                          <li
                            key={node.path}
                            css={{
                              marginBottom: 5,
                            }}
                          >
                            <Link
                              css={{
                                textDecoration: 'none',
                                color: colors.B.D55,
                                textTransform: 'capitalize',

                                '&:hover': {
                                  color: colors.B.base,
                                },
                              }}
                              to={node.path}
                            >
                              {node.path
                                .replace(new RegExp(/(\/)/g), ' ')
                                .replace(key, '')
                                .trim().length
                                ? node.path.replace(new RegExp(/(\/)/g), ' ').replace(key, '')
                                : 'index'}
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
