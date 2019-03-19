/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { StaticQuery, graphql, Link } from 'gatsby';
import { colors, gridSize } from '@arch-ui/theme';
import { jsx } from '@emotion/core';

export const Sidebar = () => (
  <StaticQuery
    query={graphql`
      query HeadingQuery {
        allSitePage(
          filter: { path: { ne: "/dev-404-page/" } }
          sort: { fields: [context___sortOrder, context___pageTitle] }
        ) {
          edges {
            node {
              path
              context {
                navGroup
                isPackageIndex
                pageTitle
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
          if (!pageList[node.context.navGroup]) {
            pageList[node.context.navGroup] = [];
          }
          pageList[node.context.navGroup].push(node);
        }

        return pageList;
      }, {});

      const navGroups = Object.keys(navData);

      return (
        <nav>
          {navGroups.map(navGroup => {
            const intro = navData[navGroup].find(node => node.context.pageTitle === 'Introduction');
            return (
              <div key={navGroup}>
                <GroupHeading>{navGroup.replace('-', ' ')}</GroupHeading>
                <List>
                  {intro && (
                    <ListItem key={intro.path} to={intro.path}>
                      Introduction
                    </ListItem>
                  )}
                  {navData[navGroup]
                    .filter(node => node.context.pageTitle !== 'Introduction')
                    .filter(node => navGroup !== 'packages' || node.context.isPackageIndex)
                    .map(node => {
                      return (
                        <ListItem key={node.path} to={node.path}>
                          {node.context.pageTitle}
                        </ListItem>
                      );
                    })}
                </List>
              </div>
            );
          })}
        </nav>
      );
    }}
  />
);

const GroupHeading = props => (
  <h3
    css={{
      color: colors.N80,
      fontSize: '0.9rem',
      fontWeight: 700,
      marginTop: '2.4em',
      textTransform: 'uppercase',
    }}
    {...props}
  />
);
const List = props => (
  <ul css={{ listStyle: 'none', fontSize: '0.9rem', padding: 0, margin: 0 }} {...props} />
);
const ListItem = props => (
  <li>
    <Link
      css={{
        color: colors.N80,
        borderRadius: 3,
        display: 'block',
        overflow: 'hidden',
        marginBottom: 1,
        padding: `${gridSize * 0.75}px ${gridSize * 1.5}px`,
        textDecoration: 'none',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',

        ':hover, :focus': {
          backgroundColor: colors.B.A5,
          color: colors.N100,
          textDecoration: 'none',
        },
        ':active': {
          backgroundColor: colors.B.A10,
        },

        '&[aria-current="page"]': {
          backgroundColor: colors.B.A10,
          fontWeight: 500,
        },
      }}
      {...props}
    />
  </li>
);
