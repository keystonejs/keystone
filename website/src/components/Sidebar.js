/** @jsx jsx */

import React, { useEffect, useRef, useState } from 'react'; // eslint-disable-line no-unused-vars
import { jsx } from '@emotion/core';
import { gridSize } from '@arch-ui/theme';
import throttle from 'lodash.throttle';
import { colors } from '@arch-ui/theme';

import { Footer, SidebarNav, Search, SocialIconsNav } from '../components';
import { media, mediaMax } from '../utils/media';

const layoutGutter = gridSize * 4;
let oldSidebarOffset = 0;
let oldWindowOffset = 0;

export const SIDEBAR_WIDTH = 280;

export const Sidebar = ({ offsetTop, isVisible, mobileOnly = false }) => {
  const asideRef = useRef();
  const [isStuck, setSticky] = useState(false);

  const handleWindowScroll = () => {
    oldWindowOffset = window.pageYOffset;
    if (window.pageYOffset > offsetTop && !isStuck) {
      setSticky(true);
    }
    if (window.pageYOffset <= offsetTop && isStuck) {
      setSticky(false);
    }
  };

  const maintainSidebarScroll = throttle(() => {
    oldSidebarOffset = asideRef.current.scrollTop;
  });

  useEffect(() => {
    const asideEl = asideRef.current; // maintain ref for cleanup
    window.addEventListener('scroll', handleWindowScroll);
    asideEl.addEventListener('scroll', maintainSidebarScroll);

    // cleanup
    return () => {
      window.removeEventListener('scroll', handleWindowScroll);
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

  const stickyStyles = {
    height: isStuck ? '100%' : `calc(100% - ${offsetTop}px)`,
    position: isStuck ? 'fixed' : 'absolute',
    width: SIDEBAR_WIDTH,
    top: isStuck ? 0 : offsetTop,
  };

  // NOTE: the 5px gutter is to stop inner elements outline/box-shadow etc.
  // being cropped because the aside has overflow-x hidden (due to y=auto).
  const avoidCropGutter = 5;

  return (
    <aside
      key="sidebar"
      ref={asideRef}
      css={{
        boxSizing: 'border-box',
        overflowY: 'auto',
        paddingBottom: '3rem',
        paddingTop: layoutGutter,
        marginLeft: -avoidCropGutter,
        paddingLeft: avoidCropGutter,

        [mediaMax.sm]: {
          display: isVisible ? 'block' : 'none',
        },
        [media.sm]: {
          display: mobileOnly ? 'none' : 'block',
          paddingRight: layoutGutter,
          ...stickyStyles,
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

      <Search />
      <p css={{ color: colors.N40, fontSize: '0.9em' }}>
        Looking for{' '}
        <a css={{ color: colors.N80 }} href="http://v4.keystonejs.com">
          v4 docs
        </a>
        ?{' '}
      </p>
      <SidebarNav />
      <Footer />
    </aside>
  );
};
