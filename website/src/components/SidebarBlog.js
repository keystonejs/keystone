/** @jsx jsx */
import { useLayoutEffect, useRef } from 'react';
import { jsx } from '@emotion/core';
import { Location } from '@reach/router';

import { SocialIconsNav } from '.';
import { useNavDataBlog } from '../utils/nav-data-blog';
import { mediaMax } from '../utils/media';
import { useClickOutside } from '../utils/useClickOutside';
import { Footer, navStyles, NavGroup } from './Sidebar';

let scrollOffset = 0;

export const SIDEBAR_WIDTH = 280;

export const SidebarBlog = ({ isVisible, toggleSidebar, mobileOnly }) => {
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
    <aside key="sidebar" ref={asideRef} css={navStyles({ isVisible, mobileOnly })}>
      <SocialIconsNav
        css={{
          marginBottom: '2.4em',
          display: 'none',
          [mediaMax.sm]: {
            display: 'block',
          },
        }}
      />
      <SidebarBlogNav />
      <Footer />
    </aside>
  );
};

// Styled Components
// ------------------------------

// Navigation

export const SidebarBlogNav = () => {
  const navData = useNavDataBlog();
  return (
    <Location>
      {({ location: { pathname } }) => (
        <nav aria-label="Blog Menu">
          {navData.map((navGroup, i) => {
            return <NavGroup key={i} index={i} navGroup={navGroup} pathname={pathname} />;
          })}
        </nav>
      )}
    </Location>
  );
};
