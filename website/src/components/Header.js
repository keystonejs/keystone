/** @jsx jsx */

import React, { forwardRef } from 'react'; // eslint-disable-line no-unused-vars
import { Link } from 'gatsby';
import { jsx } from '@emotion/core';
import { colors, gridSize } from '@arch-ui/theme';

import logosvg from '../images/logo.svg';
import { Container } from '../components';
import { media } from '../utils/media';

export const Header = forwardRef(({ toggleMenu, ...props }, ref) => (
  <header ref={ref} {...props}>
    <Container>
      <div
        css={{
          alignItems: 'center',
          boxShadow: `0 1px 0 rgba(0, 0, 0, 0.1)`,
          display: 'flex',
          justifyContent: 'space-between',
          paddingBottom: 12,
          paddingTop: 12,
        }}
      >
        <Logo />
        <Nav toggleMenu={toggleMenu} />
      </div>
    </Container>
  </header>
));

// ==============================
// Styled Components
// ==============================

const Logo = () => (
  <Link to="/">
    <img alt="KeystoneJS Logo" src={logosvg} css={{ width: 40 }} />
  </Link>
);
const NavItem = ({ as, lgOnly, ...props }) => {
  const Tag = props.to ? Link : as;
  return (
    <li>
      <Tag
        href="https://github.com/keystonejs/keystone-5"
        css={{
          background: 0,
          border: 0,
          color: colors.N60,
          cursor: 'pointer',
          outline: 0,
          padding: `${gridSize / 2}px ${gridSize}px`,
          textDecoration: 'none',

          [media.xs]: {
            display: lgOnly ? 'none' : 'block',
          },

          ':hover, :focus': {
            color: colors.N80,
            textDecoration: 'none',
          },
        }}
        {...props}
      />
    </li>
  );
};
NavItem.defaultProps = {
  as: 'a',
};
const List = props => (
  <ul
    css={{
      alignItems: 'center',
      display: 'flex',
      fontSize: '0.9rem',
      fontWeight: 500,
      justifyContent: 'center',
      listStyle: 'none',
      margin: 0,
      padding: 0,
    }}
    {...props}
  />
);
const Nav = ({ toggleMenu }) => (
  <nav>
    <List>
      {NAV_LINKS.map(({ url, name }) => (
        <NavItem key={name} to={url} lgOnly>
          {name}
        </NavItem>
      ))}
      <NavItem href="https://github.com/keystonejs/keystone-5" title="Opens in new window">
        GitHub
      </NavItem>
      {toggleMenu && (
        <NavItem
          as="button"
          onClick={toggleMenu}
          css={{
            [media.lg]: { display: 'none' },
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" focusable="false" role="presentation">
            <path
              d="M5 15h14v2H5zm0-8h14v2H5zm0 4h14v2H5z"
              fill="currentColor"
              fillRule="evenodd"
            />
          </svg>
        </NavItem>
      )}
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
    name: 'Discussions',
    url: '/discussions/',
  },
  {
    name: 'Packages',
    url: '/keystone-alpha/core/',
  },
];
