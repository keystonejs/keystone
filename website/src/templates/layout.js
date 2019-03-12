/** @jsx jsx */

import React, { useEffect, useRef, useState } from 'react'; // eslint-disable-line no-unused-vars
import { jsx, Global } from '@emotion/core';
import { colors, globalStyles, gridSize } from '@arch-ui/theme';

import { Container, Footer, Header, Sidebar, Search } from '../components';

const SIDEBAR_WIDTH = 240;

const Layout = ({ children }) => {
  const headerRef = useRef();
  const [headerHeight, setHeaderHeight] = useState();
  const [isStuck, setSticky] = useState(false);

  const handleScroll = () => {
    if (window.scrollY > headerHeight && !isStuck) {
      setSticky(true);
    }
    if (window.scrollY <= headerHeight && isStuck) {
      setSticky(false);
    }
  };

  useEffect(
    () => {
      setHeaderHeight(headerRef.current.offsetHeight);
    },
    [headerRef]
  );
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });

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

      <Header ref={headerRef} />
      <Container>
        <div css={{ display: 'flex' }}>
          <aside
            css={{
              borderRight: `1px solid ${colors.N10}`,
              boxSizing: 'border-box',
              height: isStuck ? '100%' : `calc(100% - ${headerHeight}px)`,
              overflowY: 'auto',
              position: isStuck ? 'fixed' : 'absolute',
              paddingRight: gridSize * 2,
              paddingBottom: gridSize * 2,
              paddingTop: gridSize * 2,
              width: SIDEBAR_WIDTH,
              top: isStuck ? 0 : headerHeight,
            }}
          >
            <Search />
            <Sidebar />
            <Footer />
          </aside>
          <main
            css={{
              flex: 1,
              marginLeft: SIDEBAR_WIDTH,
              paddingLeft: gridSize * 3,
              paddingBottom: gridSize * 3,
              paddingTop: gridSize * 3,
            }}
          >
            {children}
          </main>
        </div>
      </Container>
    </>
  );
};

export default Layout;
