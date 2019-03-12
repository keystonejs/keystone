import { jsx } from '@emotion/core';
import { Link } from 'gatsby';

import logosvg from '../images/logo.svg';
import Search from '../components/search';

import { colors } from '@arch-ui/theme';

/** @jsx jsx */

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
    name: 'APIs',
    url: '/api/keystone-alpha/core/',
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
      {navLinks.map(({ url, name }) => (
        <li css={{ padding: '0px 5px' }} key={name}>
          <Link to={url} css={{ textDecoration: 'none', color: 'black' }}>
            {name}
          </Link>
        </li>
      ))}
      <li css={{ padding: '0px 5px' }}>
        <a
          href="https://github.com/keystonejs/keystone-5"
          css={{ textDecoration: 'none', color: 'black' }}
        >
          GitHub
        </a>
      </li>
    </ul>
  </nav>
);

const Header = () => (
  <header
    css={{
      background: 'white',
      padding: '12px 16px',
      borderBottom: `1px solid ${colors.B.A25}`,
    }}
  >
    <div
      css={{
        maxWidth: 1190,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: '0 auto',
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
        <Nav />
      </div>
      <Search />
    </div>
  </header>
);

export default Header;
