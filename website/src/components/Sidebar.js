/** @jsx jsx */

import { Fragment, useLayoutEffect, useMemo, useRef } from 'react';
import { Link } from 'gatsby';
import { jsx } from '@emotion/core';
import { Location } from '@reach/router';
import { colors, gridSize } from '@arch-ui/theme';

import { SocialIconsNav } from '../components';
import { useNavData } from '../utils/hooks';
import { media, mediaMax } from '../utils/media';
import { useClickOutside } from '../utils/useClickOutside';

let scrollOffset = 0;

export const SIDEBAR_WIDTH = 280;

export const Sidebar = ({ isVisible, toggleSidebar, mobileOnly }) => {
  const asideRef = useRef();

  // handle click outside when sidebar is a drawer on small devices
  useClickOutside({
    handler: toggleSidebar,
    refs: [asideRef],
    listenWhen: isVisible,
  });

  // NOTE: maintain the user's scroll whilst navigating between pages.
  // This is a symptom of Gatsby remounting the entire tree (template) on each
  // page change via `createPage` in "gatsby-node.js".
  useLayoutEffect(() => {
    asideRef.current.scrollTop = scrollOffset; // reset on mount
    return () => {
      scrollOffset = asideRef.current.scrollTop; // catch on unmount (this is buggy of some reason)
    };
  }, []);

  return (
    <aside
      key="sidebar"
      ref={asideRef}
      css={{
        boxSizing: 'border-box',
        flexShrink: 0,
        height: 'calc(100vh - 60px)',
        overflowY: 'auto',
        padding: `${gridSize * 4}px ${gridSize * 3}px`,
        position: 'sticky',
        top: 60,
        WebkitOverflowScrolling: 'touch',
        width: SIDEBAR_WIDTH,

        [mediaMax.md]: {
          background: 'white',
          boxShadow: isVisible ? 'rgba(0, 0, 0, 0.25) 0px 0px 48px' : 'none',
          height: '100vh',
          opacity: isVisible ? 1 : 0,
          position: 'fixed',
          top: 0,
          transform: isVisible ? 'translateX(0px)' : `translateX(-${SIDEBAR_WIDTH}px)`,
          transition: 'all 150ms',
          zIndex: 2,
        },
        [media.md]: {
          display: mobileOnly ? 'none' : 'block',
        },
      }}
    >
      <SocialIconsNav
        css={{
          marginBottom: '2.4em',
          display: 'none',
          [mediaMax.sm]: {
            display: 'block',
          },
        }}
      />

      <SidebarNav />
      <Footer />
      <ClassicDocs />
    </aside>
  );
};

const ClassicDocs = () => (
  <p css={{ color: colors.N40, fontSize: '0.9em', margin: 0 }}>
    Looking for{' '}
    <a css={{ color: colors.N80 }} href="http://v4.keystonejs.com">
      v4 docs
    </a>
    ?
  </p>
);

// Styled Components
// ------------------------------

// Navigation

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
      color: colors.N40,
      fontSize: '0.8rem',
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
          color: colors.B.base,
          textDecoration: 'none',
        },
        ':active': {
          backgroundColor: colors.B.A10,
        },

        '&[aria-current="page"]': {
          backgroundColor: colors.B.A10,
          color: colors.N80,
          fontWeight: 500,
        },
      }}
      activeClassName="docSearch-lvl1"
      {...props}
    />
  </li>
);

// Footer

const FooterAnchor = props => <a css={{ color: colors.N60, textDecoration: 'none' }} {...props} />;

export const Footer = () => (
  <footer
    css={{
      borderBottom: `1px solid ${colors.N10}`,
      borderTop: `1px solid ${colors.N10}`,
      color: colors.N40,
      fontSize: '0.75rem',
      marginTop: '3rem',
      paddingBottom: '1.25em',
      paddingTop: '1.25em',
      textAlign: 'center',
      marginBottom: '2rem',
    }}
  >
    Made with ❤️ by{' '}
    <FooterAnchor href="https://www.thinkmill.com.au" target="_blank">
      Thinkmill
    </FooterAnchor>{' '}
    and
    <br />
    amazing{' '}
    <FooterAnchor href="https://github.com/keystonejs/keystone/graphs/contributors" target="_blank">
      contributors
    </FooterAnchor>
  </footer>
);
