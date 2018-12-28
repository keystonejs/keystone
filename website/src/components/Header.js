import React from 'react';
import { jsx } from '@emotion/core';
import { Link } from 'gatsby';

import logosvg from '../images/logo.svg';
import Search from '../components/search';

import { colors } from '../styles';
// import { colors } from '@voussoir/ui/src/theme';

/* @jsx jsx */

const Logo = () => (
  <Link
    to="/"
    css={{
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      color: 'black',
      fontSize: '1.25em',
    }}
  >
    <img alt="Keystone JS" src={logosvg} css={{ width: 40, marginRight: 12 }} />
  </Link>
);

const navLinks = [
  {
    name: 'Get Started',
    url: '/getting-started',
  },
  {
    name: 'Docs',
    url: '/docs',
  },
  {
    name: 'Guides',
    url: '/guides',
  },
  {
    name: 'Tutorials',
    url: '/tutorials',
  },
  {
    name: 'APIs',
    url: '/voussoir',
  },
];

const Nav = () => (
  <nav>
    <ul
      css={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      {navLinks.map(link => (
        <li css={{ padding: '0px 5px' }}>
          <Link to={link.url} css={{ textDecoration: 'none', color: 'black' }}>
            {link.name}
          </Link>
        </li>
      ))}
    </ul>
  </nav>
);

const Header = () => (
  <header
    css={{
      background: 'white',
      padding: '12px 16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: `1px solid ${colors.B.A25}`,
    }}
  >
    <div
      css={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Logo />
      <Nav links={navLinks} />
    </div>
    <Search />
  </header>
);

export default Header;
