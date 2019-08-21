/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { Link } from 'gatsby';
import { colors, gridSize } from '@arch-ui/theme';
import { jsx } from '@emotion/core';
import { useNavData } from '../utils/hooks';

export const SidebarNav = () => {
  const navData = useNavData();
  console.log({ navData });
  return (
    <nav aria-label="Documentation Menu">
      {navData.map(navGroup => {
        const sectionId = `docs-menu-${navGroup.navTitle}`;
        console.log({ navGroup });
        return (
          <div key={navGroup.navTitle}>
            <GroupHeading id={sectionId}>{navGroup.navTitle.replace('-', ' ')}</GroupHeading>
            <List aria-labelledby={sectionId}>
              {navGroup.pages.map(node => {
                return (
                  <ListItem key={node.path} to={node.path}>
                    {node.context.pageTitle}
                  </ListItem>
                );
              })}
              {navGroup.subNavs.length ? (
                <li>
                  {navGroup.subNavs.map(navGroup => {
                    console.log(navGroup);
                    return (
                      <>
                        <GroupSubHeading id={sectionId}>
                          {navGroup.navTitle.replace('-', ' ')}
                        </GroupSubHeading>
                        <List aria-labelledby={sectionId}>
                          {navGroup.pages.map(node => {
                            return (
                              <ListItem key={node.path} to={node.path}>
                                {node.context.pageTitle}
                              </ListItem>
                            );
                          })}
                        </List>
                      </>
                    );
                  })}
                </li>
              ) : null}
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
      fontSize: '1rem',
      fontWeight: 700,
      marginTop: '2.4em',
      textTransform: 'uppercase',
    }}
    {...props}
  />
);

const GroupSubHeading = props => (
  <h3
    css={{
      color: colors.N60,
      fontSize: '0.9rem',
      fontWeight: 700,
      padding: `${gridSize * 0.75}px 0`,
      margin: '0',
      marginTop: '1rem',
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
