/** @jsx jsx */

import React, { useMemo, Fragment } from 'react'; // eslint-disable-line no-unused-vars
import { Link } from 'gatsby';
import { colors, gridSize } from '@arch-ui/theme';
import { jsx } from '@emotion/core';
import { Location } from '@reach/router';
import { useNavData } from '../utils/hooks';

export const SidebarNav = () => {
  const navData = useNavData();
  return (
    <Location>
      {({ location: { pathname } }) => (
        <nav aria-label="Documentation Menu">
          {navData.map((navGroup, i) => {
            return <NavGroup key={i} index={i} navGroup={navGroup} pathname={pathname} />;
          })}
        </nav>
      )}
    </Location>
  );
};

const NavGroup = ({ index, navGroup, pathname }) => {
  const sectionId = `docs-menu-${navGroup.navTitle}`;

  const isPageInGroupActive = useMemo(() => {
    let paths = [];

    navGroup.pages.forEach(i => paths.push(i.path));

    if (navGroup.subNavs.length) {
      navGroup.subNavs.forEach(group => group.pages.forEach(i => paths.push(i.path)));
    }

    return paths.some(i => i === pathname);
  }, [pathname]);

  return (
    <div key={navGroup.navTitle}>
      <GroupHeading
        id={sectionId}
        index={index}
        className={isPageInGroupActive ? 'docSearch-lvl0' : null}
      >
        {navGroup.navTitle.replace('-', ' ')}
      </GroupHeading>
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
              return (
                <Fragment key={navGroup.navTitle}>
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
                </Fragment>
              );
            })}
          </li>
        ) : null}
      </List>
    </div>
  );
};

const GroupHeading = ({ index, ...props }) => (
  <h2
    css={{
      color: colors.N80,
      fontSize: '1rem',
      fontWeight: 700,
      marginTop: index === 0 ? '4px' : '2.4em',
      textTransform: 'capitalize',
    }}
    {...props}
  />
);

const GroupSubHeading = props => (
  <h3
    css={{
      color: colors.N60,
      fontSize: '0.85rem',
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
      activeClassName="docSearch-lvl1"
      {...props}
    />
  </li>
);
