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
          {console.log(pathname)}
          {navData.map((navGroup, i) => {
            return <NavGroup key={i} navGroup={navGroup} pathname={pathname} />;
          })}
        </nav>
      )}
    </Location>
  );
};

const NavGroup = ({ navGroup, pathname }) => {
  const sectionId = `docs-menu-${navGroup.navTitle}`;

  const isPageInGroupActive = useMemo(() => {
    const pathsForGroup = [
      ...navGroup.pages.map(p => p.path),
      ...(navGroup.subNavs.length
        ? navGroup.subNavs.map(navGroup => navGroup.pages.map(page => page.path))
        : []),
    ].flat();
    return pathsForGroup.some(i => i === pathname);
  }, [pathname]);

  return (
    <div key={navGroup.navTitle}>
      <GroupHeading id={sectionId} className={isPageInGroupActive ? 'docSearch-lvl0' : null}>
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

const GroupHeading = props => (
  <h2
    css={{
      color: colors.N80,
      fontSize: '1.4rem',
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
      activeClassName="docSearch-lvl1"
      {...props}
    />
  </li>
);
