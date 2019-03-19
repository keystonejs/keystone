/** @jsx jsx */

import React, { useEffect, useRef, useState } from 'react'; // eslint-disable-line no-unused-vars
import { jsx, Global } from '@emotion/core';
import { borderRadius, colors, globalStyles, gridSize } from '@arch-ui/theme';
import throttle from 'lodash.throttle';

import { Footer, Header, Sidebar, Search } from '../components';
import { Container, CONTAINER_GUTTERS } from '../components/Container';
import { media, mediaMax } from '../utils/media';
import { useDimensions } from '../utils/hooks';

const SIDEBAR_WIDTH = 260;

const Layout = ({ children }) => {
  const [isVisible, setVisible] = useState(false);
  const toggleMenu = bool => () => setVisible(bool);
  const [headerRef, headerDimensions] = useDimensions();

  return (
    <>
      <Global
        styles={{
          ...globalStyles,

          [mediaMax.sm]: {
            body: { fontSize: 'inherit' },
            html: { fontSize: 14 },
          },
          [media.sm]: {
            body: { fontSize: 'inherit' },
            html: { fontSize: 16 },
          },
        }}
      />
      <Header key="global-header" ref={headerRef} toggleMenu={toggleMenu(!isVisible)} />
      <Container>
        <Aside isVisible={isVisible} offsetTop={headerDimensions.height} key="sidebar">
          <Search />
          <Sidebar />
          <Footer />
        </Aside>
        <Main key="main">{children}</Main>
      </Container>
    </>
  );
};

// ==============================
// Styled Components
// ==============================

const gutter = gridSize * 4;
let oldSidebarOffset = 0;
let oldWindowOffset = 0;

const Aside = ({ offsetTop, isVisible, ...props }) => {
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

  return (
    <aside
      ref={asideRef}
      css={{
        boxSizing: 'border-box',
        overflowY: 'auto',
        paddingBottom: '3rem',
        paddingTop: gutter,
        paddingLeft: 3, // NOTE: the 3px is to stop the select's shadows being cropped

        [mediaMax.sm]: {
          display: isVisible ? 'block' : 'none',
        },
        [media.sm]: {
          paddingRight: gutter,
          ...stickyStyles,
        },
      }}
      {...props}
    />
  );
};
const Main = props => (
  <main
    css={{
      minWidth: 0,
      lineHeight: '1.6',
      paddingBottom: '3rem',
      paddingTop: gutter,

      [media.sm]: {
        marginLeft: SIDEBAR_WIDTH,
        paddingLeft: gutter,
      },

      // TODO: doesn't play nice with "gatsby-resp-image-wrapper"
      img: {
        backgroundColor: 'white',
        borderRadius,
        boxSizing: 'border-box',
        boxShadow: '0 0 0 1px hsla(0, 0%, 0%, 0.1), 0 4px 11px hsla(0, 0%, 0%, 0.1) !important',
        display: 'block',
        marginBottom: '2rem',
        marginTop: '2rem',
        maxWidth: '100%',
      },

      // NOTE: consider removing `gatsby-resp-image-wrapper`
      '.gatsby-resp-image-link, .gatsby-resp-image-link:hover, .gatsby-resp-image-link:focus': {
        background: 0,
        border: 0,
        marginBottom: '2rem',
        marginTop: '2rem',
      },

      // Misc. Typography
      // ------------------------------
      ul: {
        lineHeight: 1.8,
      },
      'ul > li > ul, ol > li > ol, ul > li > ol, ol > li > ul': {
        paddingLeft: '1.33rem',
      },
      blockquote: {
        fontSize: '1.25rem',
        fontStyle: 'italic',
        color: colors.N60,
        margin: `3rem 0`,
        padding: 0,
        paddingLeft: '3rem',
        position: 'relative',
      },

      // Code
      // ------------------------------

      code: {
        fontFamily: 'Consolas, Menlo, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
        fontSize: '0.85em',
        fontWeight: 'normal',
      },
      pre: {
        backgroundColor: 'rgba(9, 30, 66, 0.03)',
        boxShadow: '-4px 0 0 rgba(9, 30, 66, 0.09)',
        boxSizing: 'border-box',
        fontFamily: 'Consolas,Menlo,Monaco,"Andale Mono","Ubuntu Mono",monospace',
        lineHeight: '1.4',
        padding: gridSize * 2,
        overflowX: 'auto',
        tabSize: 2,
        WebkitOverflowScrolling: 'touch',

        // our snippets seem to have an extra line...
        '.token-line:last-of-type': {
          display: 'none',
        },

        [mediaMax.sm]: {
          marginLeft: -CONTAINER_GUTTERS[0],
          marginRight: -CONTAINER_GUTTERS[0],
        },
      },

      '& :not(pre) > code': {
        backgroundColor: 'rgba(255, 227, 128,0.2)',
        borderRadius: 2,
        color: colors.N100,
        margin: 0,
        padding: '0.2em 0.4em',
      },

      '& h1 > code, & h2 > code, & h3 > code, & h4 > code, & h5 > code, & h6 > code': {
        backgroundColor: 'rgba(255, 235, 229, 0.6)',
      },
    }}
    {...props}
  />
);

export default Layout;
