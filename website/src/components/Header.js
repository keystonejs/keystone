/** @jsx jsx */

import React, { forwardRef } from 'react'; // eslint-disable-line no-unused-vars
import { Link } from 'gatsby';
import { jsx } from '@emotion/core';
import { colors, gridSize } from '@arch-ui/theme';

import logosvg from '../images/logo.svg';
import { Container } from '../components';

export const Header = forwardRef((props, ref) => (
  <header ref={ref}>
    <Container>
      <div
        css={{
          alignItems: 'center',
          borderBottom: `1px solid ${colors.N10}`,
          display: 'flex',
          justifyContent: 'space-between',
          paddingBottom: 12,
          paddingTop: 12,
        }}
      >
        <Logo />
        <Nav />
      </div>
    </Container>
  </header>
));

// ==============================
// Styled Components
// ==============================

const Logo = () => (
  <Link to="/">
    <img alt="Keystone JS" src={logosvg} css={{ width: 40 }} />
  </Link>
);
const NavItem = props => {
  const Tag = props.to ? Link : 'a';
  return (
    <li>
      <Tag
        href="https://github.com/keystonejs/keystone-5"
        css={{
          color: colors.N60,
          fontSize: '0.9em',
          fontWeight: 500,
          paddingBottom: gridSize / 2,
          paddingTop: gridSize / 2,
          paddingLeft: gridSize,
          paddingRight: gridSize,
          textDecoration: 'none',
        }}
        {...props}
      />
    </li>
  );
};
const List = props => (
  <ul
    css={{
      display: 'flex',
      justifyContent: 'center',
      listStyle: 'none',
      margin: 0,
      padding: 0,
    }}
    {...props}
  />
);
const Nav = () => (
  <nav>
    <List>
      {NAV_LINKS.map(({ url, name }) => (
        <NavItem key={name} to={url}>
          {name}
        </NavItem>
      ))}
      <NavItem href="https://github.com/keystonejs/keystone-5">GitHub</NavItem>
    </List>
  </nav>
);

// ==============================
// Data
// ==============================

const NAV_LINKS = [
  {
    name: 'Quick Start',
    url: '/quick-start',
  },
  {
    name: 'Guides',
    url: '/guides/',
  },
  {
    name: 'Tutorials',
    url: '/tutorials/',
  },
  {
    name: 'Packages',
    url: '/keystone-alpha/core/',
  },
];
