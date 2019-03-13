import React from 'react'; // eslint-disable-line no-unused-vars
import { StaticQuery, graphql, Link } from 'gatsby';

import { colors } from '@arch-ui/theme';
import { jsx } from '@emotion/core';

/** @jsx jsx */

const prettyName = (node, category) => {
  const cat = category.replace('@', '');

  let pretty = node.path
    .replace('/api', '')
    .replace(cat, '')
    .replace(new RegExp(/(\/\/)/g), '')
    .replace(new RegExp(/\/$/g), '')
    .replace(new RegExp(/^\//g), '')
    .replace('-', ' ')
    .trim();

  return pretty === '' ? 'index' : pretty;
};

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
                navGroup
              }
            }
          }
        }
      }
    `}
    render={data => {
      const navData = data.allSitePage.edges.reduce((pageList, { node }) => {
        // finding out what directory the file is in (eg '/keystone-alpha')

        if (node.context.navGroup !== null) {
          let dir;

          if (node.context.navGroup.includes('api')) {
            dir = node.context.navGroup.match('api/@?([a-z]|_|-)+/?')[0].replace('api/', '');
          } else {
            dir = node.context.navGroup;
          }

          if (!pageList[dir]) {
            pageList[dir] = [];
          }
          pageList[dir].push(node);
        }

        return pageList;
      }, {});

      console.log(navData);

      const categories = Object.keys(navData).sort(x => {
        return x.startsWith('@') ? 0 : -1;
      });

      return (
        <div>
          {categories.map(category => {
            return (
              <div key={category}>
                <span
                  css={{
                    fontSize: '1.25em',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                  }}
                >
                  {category}
                </span>
                <ul
                  css={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '0 0 32px 0',
                  }}
                >
                  {navData[category].map(node => {
                    return (
                      <li key={node.path} css={{}}>
                        <Link
                          css={{
                            textDecoration: 'none',
                            color: colors.B.D50,
                            textTransform: 'capitalize',
                            marginLeft: 4,

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
                          {prettyName(node, category)}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      );
    }}
  />
);
