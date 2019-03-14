/** @jsx jsx */

import React, { useEffect, useRef, useState } from 'react'; // eslint-disable-line no-unused-vars
import { jsx, Global } from '@emotion/core';
import { borderRadius, colors, globalStyles, gridSize } from '@arch-ui/theme';
import throttle from 'lodash.throttle';

import { Container, Footer, Header, Sidebar, Search } from '../components';
import { media } from '../utils/media';

const SIDEBAR_WIDTH = 260;

const Layout = ({ children }) => {
  const headerRef = useRef(null);
  const [isVisible, setVisible] = useState(false);
  const toggleMenu = bool => () => setVisible(bool);

  return (
    <>
      <Global
        styles={{
          ...globalStyles,

          [media.sm]: {
            body: { fontSize: 'inherit' },
            html: { fontSize: 14 },
          },
          [media.lg]: {
            body: { fontSize: 'inherit' },
            html: { fontSize: 16 },
          },
        }}
      />
      <Header key="global-header" ref={headerRef} toggleMenu={toggleMenu(!isVisible)} />
      <Container>
        <div css={{ display: 'flex', [media.sm]: { flexDirection: 'column' } }}>
          <Aside isVisible={isVisible} offsetTarget={headerRef}>
            <Search />
            <Sidebar />
            <Footer />
          </Aside>
          <Main>{children}</Main>
        </div>
      </Container>
    </>
  );
};

// ==============================
// Styled Components
// ==============================

const gutter = gridSize * 4;

let oldScrollTop = 0;

const Aside = ({ offsetTarget, isVisible, ...props }) => {
  const asideRef = useRef();
  const [isStuck, setSticky] = useState(Boolean(offsetTarget));
  const offsetTop = offsetTarget.current ? offsetTarget.current.offsetHeight : 0;

  const handleWindowScroll = () => {
    if (window.pageYOffset > offsetTop && !isStuck) {
      setSticky(true);
    }
    if (window.pageYOffset <= offsetTop && isStuck) {
      setSticky(false);
    }
  };

  const maintainSidebarScroll = throttle(() => {
    oldScrollTop = asideRef.current.scrollTop;
  });

  useEffect(() => {
    handleWindowScroll();
    window.addEventListener('scroll', handleWindowScroll);
    asideRef.current.addEventListener('scroll', maintainSidebarScroll);

    // keep the user's scroll whilst navigating between pages
    asideRef.current.scrollTo(0, oldScrollTop);

    // cleanup
    return () => {
      window.removeEventListener('scroll', handleWindowScroll);
      asideRef.current.removeEventListener('scroll', maintainSidebarScroll);
    };
  });

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
        // borderRight: `1px solid ${colors.N10}`,
        boxSizing: 'border-box',
        overflowY: 'auto',
        paddingBottom: gutter,
        paddingTop: gutter,
        paddingLeft: 3, // NOTE: the 3px is to stop the select's shadows being cropped

        [media.sm]: {
          display: isVisible ? 'block' : 'none',
        },
        [media.lg]: {
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
      flex: 1,
      lineHeight: '1.6',
      minWidth: 0,
      paddingBottom: gutter * 2,
      paddingTop: gutter,

      [media.lg]: {
        marginLeft: SIDEBAR_WIDTH,
        paddingLeft: gutter,
      },

      // Tables
      // ------------------------------

      table: {
        borderCollapse: 'collapse',
        borderSpacing: 0,
        fontSize: '0.9rem',
        width: '100%',
      },
      'th, td': {
        paddingBottom: gridSize,
        paddingTop: gridSize,
        textAlign: 'left',

        '&[align="right"]': {
          textAlign: 'right',
        },
      },
      th: {
        borderBottom: `2px solid ${colors.N10}`,
        fontWeight: 500,
      },
      td: {
        borderTop: `1px solid ${colors.N10}`,
      },

      // TODO: doesn't play nice with "gatsby-resp-image-wrapper"
      img: {
        backgroundColor: 'white',
        borderRadius,
        boxSizing: 'border-box',
        boxShadow: '0 0 0 1px hsla(0, 0%, 0%, 0.1), 0 4px 11px hsla(0, 0%, 0%, 0.1) !important',
        maxWidth: '100%',
        padding: 4,
      },

      // Misc. Typography
      // ------------------------------

      a: {
        borderBottom: `1px solid ${colors.B.A40}`,
        color: colors.N100,
        textDecoration: 'none',

        ':hover, :focus': {
          backgroundColor: colors.B.A10,
          borderBottomColor: 'currentColor',
          textDecoration: 'none',
        },
      },

      // NOTE: consider removing `gatsby-remark-images`
      '.gatsby-resp-image-link, .gatsby-resp-image-link:hover, .gatsby-resp-image-link:focus': {
        background: 0,
        border: 0,
      },
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
        width: '100%',
        WebkitOverflowScrolling: 'touch',

        '.token-line:last-of-type': {
          display: 'none', // our snippets seem to have an extra line...
        },
      },

      '& :not(pre) > code': {
        backgroundColor: 'rgba(255, 227, 128,0.2)',
        borderRadius: 2,
        color: colors.N100,
        margin: 0,
        padding: '0.2em 0.4em',

        [media.sm]: {
          wordBreak: 'break-word',
        },
      },
    }}
    {...props}
  />
);

export default Layout;
