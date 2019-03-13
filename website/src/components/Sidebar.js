/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { StaticQuery, graphql, Link } from 'gatsby';
import { colors, gridSize } from '@arch-ui/theme';
import { jsx } from '@emotion/core';

const prettyName = (node, navGroup) => {
  let pretty = node.path
    .replace('/packages', '')
    .replace(navGroup, '')
    .replace(new RegExp(/(\/\/)/g), '')
    .replace(new RegExp(/\/$/g), '')
    .replace(new RegExp(/^\//g), '')
    .replace('-', ' ')
    .trim();

  return pretty === '' ? 'index' : pretty;
};

export const Sidebar = () => (
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
            return (
              <div key={navGroup}>
                <GroupHeading>{navGroup}</GroupHeading>
                <List>
                  {navData[navGroup].map(node => {
                    return (
                      <ListItem key={node.path} to={node.path}>
                        {prettyName(node, navGroup)}
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
        color: colors.B.D50,
        display: 'block',
        overflow: 'hidden',
        paddingBottom: gridSize * 0.75,
        paddingTop: gridSize * 0.75,
        textDecoration: 'none',
        textOverflow: 'ellipsis',
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',

        ':hover, :focus': {
          // color: colors.B.base,
          textDecoration: 'underline',
        },

        '&[aria-current="page"]': {
          color: colors.B.base,
          fontWeight: 'bold',
        },
      }}
      {...props}
    />
  </li>
);
