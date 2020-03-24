/** @jsx jsx */

import { useEffect, useRef, useState } from 'react'; // eslint-disable-line no-unused-vars
import { jsx } from '@emotion/core';
import throttle from 'lodash.throttle';
import { colors } from '@arch-ui/theme';

import { Footer, SidebarNav, SocialIconsNav } from '../components';
import { media, mediaMax } from '../utils/media';
import { useClickOutside } from '../utils/useClickOutside';
import { gridSize } from '@arch-ui/theme/src';

let oldSidebarOffset = 0;
let oldWindowOffset = 0;

export const SIDEBAR_WIDTH = 280;

export const Sidebar = ({ offsetTop, isVisible, toggleSidebar, mobileOnly }) => {
  const asideRef = useRef();
  const maintainSidebarScroll = throttle(() => {
    oldSidebarOffset = asideRef.current.scrollTop;
  });

  useClickOutside({
    handler: toggleSidebar,
    refs: [asideRef],
    listenWhen: isVisible,
  });

  useEffect(() => {
    const asideEl = asideRef.current; // maintain ref for cleanup
    asideEl.addEventListener('scroll', maintainSidebarScroll);

    // cleanup
    return () => {
      asideEl.removeEventListener('scroll', maintainSidebarScroll);
    };
  });

  // NOTE: maintain the user's scroll whilst navigating between pages.
  // This is a symptom of Gatsby remounting the entire tree (template) on each
  // page change via `createPage` in "gatsby-node.js".
  useEffect(() => {
    const scrollTop = oldWindowOffset ? oldSidebarOffset + offsetTop : oldSidebarOffset;
    asideRef.current.scrollTop = scrollTop;
  }, [asideRef.current]);

  return (
    <aside
      key="sidebar"
      ref={asideRef}
      css={{
        boxSizing: 'border-box',
        flexShrink: 0,
        width: SIDEBAR_WIDTH,
        height: 'calc(100vh - 60px)',
        padding: `${gridSize * 4}px ${gridSize * 3}px`,
        overflowY: 'auto',
        position: 'sticky',
        top: 60,

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
