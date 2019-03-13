/** @jsx jsx */

import React, { useEffect, useRef, useState } from 'react'; // eslint-disable-line no-unused-vars
import { jsx, Global } from '@emotion/core';
import { borderRadius, colors, globalStyles, gridSize } from '@arch-ui/theme';
import throttle from 'lodash.throttle';

import { Container, Footer, Header, Sidebar, Search } from '../components';

const SIDEBAR_WIDTH = 260;

const Layout = ({ children }) => {
  const headerRef = useRef(null);

  return (
    <>
      <Global
        styles={{
          ...globalStyles,

          // TODO: doesn't play nice with "gatsby-resp-image-wrapper"
          'main img': {
            backgroundColor: 'white',
            borderRadius,
            boxSizing: 'border-box',
            boxShadow: '0 0 0 1px hsla(0, 0%, 0%, 0.1), 0 4px 11px hsla(0, 0%, 0%, 0.1) !important',
            maxWidth: '100%',
            padding: 4,
          },
          'main a': {
            borderBottom: '1px solid rgba(0, 0, 0, 0.2)',
            color: colors.N100,
            textDecoration: 'none',

            ':hover, :focus': {
              backgroundColor: colors.B.A10,
              textDecoration: 'none',
            },
          },
          'main ul': {
            lineHeight: 1.8,
          },

          code: {
            fontFamily: 'Consolas, Menlo, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
            fontSize: '0.85em',
          },
          pre: {
            backgroundColor: 'rgba(9, 30, 66, 0.03)',
            boxShadow: '-4px 0 0 rgba(9, 30, 66, 0.09)',
            boxSizing: 'border-box',
            fontFamily: 'Consolas,Menlo,Monaco,"Andale Mono","Ubuntu Mono",monospace',
            padding: gridSize * 2,
            overflowX: 'auto',
            tabSize: 2,
            width: '100%',
            '.token-line:last-of-type': {
              display: 'none', // our snippets seem to have an extra line...
            },
          },

          ':not(pre) > code': {
            backgroundColor: 'rgba(255,229,100,0.2)',
            borderRadius: 2,
            color: 'rgb(9, 30, 66)',
            margin: 0,
            padding: '0.2em 0.4em',
          },
        }}
      />

      <Header key="global-header" ref={headerRef} />
      <Container>
        <div css={{ display: 'flex' }}>
          <Aside offsetTarget={headerRef}>
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

const Aside = ({ offsetTarget, ...props }) => {
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

  return (
    <aside
      ref={asideRef}
      css={{
        borderRight: `1px solid ${colors.N10}`,
        boxSizing: 'border-box',
        height: isStuck ? '100%' : `calc(100% - ${offsetTop}px)`,
        overflowY: 'auto',
        position: isStuck ? 'fixed' : 'absolute',
        padding: gutter,
        paddingLeft: 3, // NOTE: the 3px is to stop the select's shadows being cropped
        width: SIDEBAR_WIDTH,
        top: isStuck ? 0 : offsetTop,
      }}
      {...props}
    />
  );
};
const Main = props => (
  <main
    css={{
      flex: 1,
      lineHeight: '1.4',
      marginLeft: SIDEBAR_WIDTH,
      minWidth: 0,
      paddingLeft: gutter,
      paddingBottom: gutter,
      paddingTop: gutter,
    }}
    {...props}
  />
);

export default Layout;
