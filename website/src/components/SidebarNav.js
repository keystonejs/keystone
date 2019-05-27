/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { Link } from 'gatsby';
import { colors, gridSize } from '@arch-ui/theme';
import { jsx } from '@emotion/core';
import { useNavData } from '../utils/hooks';

export const SidebarNav = () => {
  const navData = useNavData();

  const navGroups = Object.keys(navData);

  return (
    <nav aria-label="Documentation Menu">
      {navGroups.map(navGroup => {
        const sectionId = `docs-menu-${navGroup}`;

        const pages = navData[navGroup];
        return (
          <div key={navGroup}>
            <GroupHeading id={sectionId}>{navGroup.replace('-', ' ')}</GroupHeading>
            <List aria-labelledby={sectionId}>
              {pages.map(node => {
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
};

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
        outline: 0,
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
