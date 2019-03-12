/** @jsx jsx */

import React, { useEffect, useRef, useState } from 'react'; // eslint-disable-line no-unused-vars
import { jsx, Global } from '@emotion/core';
import { colors, globalStyles, gridSize } from '@arch-ui/theme';
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
          backgroundColor: 'white',

          img: {
            maxWidth: '100%',
          },
          h1: {
            marginTop: 0,
          },

          'pre[class*="language-"]': {
            padding: gridSize * 2,
            width: '100%',
            boxSizing: 'border-box',
          },

          ':not(pre) > code[class*="language-"]': {
            background: 'white',
            padding: '2px 4px',
            fontSize: '0.9em',
            overflow: 'scroll',
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
      marginLeft: SIDEBAR_WIDTH,
      paddingLeft: gutter,
      paddingBottom: gutter,
      paddingTop: gutter,
    }}
    {...props}
  />
);

export default Layout;
