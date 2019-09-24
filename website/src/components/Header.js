/** @jsx jsx */

import React, { forwardRef } from 'react'; // eslint-disable-line no-unused-vars
import { Link } from 'gatsby';
import { jsx } from '@emotion/core';
import { colors, gridSize } from '@arch-ui/theme';

import logosvg from '../assets/logo.svg';
import { Container } from '../components';
import { media, mediaOnly, mediaMax } from '../utils/media';

export const HEADER_HEIGHT = 60;

export const Header = forwardRef(({ toggleMenu, ...props }, ref) => (
  <header ref={ref} {...props}>
    <Container>
      <div
        css={{
          alignItems: 'center',
          boxShadow: `0 1px 0 ${colors.N10}`,
          display: 'flex',
          fontSize: '0.9rem',
          fontWeight: 500,
          height: HEADER_HEIGHT,
          justifyContent: 'space-between',
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
  <div css={{ alignItems: 'center', display: 'inline-flex' }}>
    <Link
      to="/"
      css={{
        alignItems: 'center',
        color: 'inherit',
        display: 'inline-flex',

        ':hover': {
          textDecoration: 'none',
          span: {
            textDecoration: 'underline',
          },
        },
      }}
    >
      <img alt="KeystoneJS Logo" src={logosvg} css={{ display: 'block', width: 40 }} />
      <span
        css={{
          marginLeft: '0.66rem',

          [mediaOnly.sm]: {
            display: 'none',
          },
        }}
      >
        KeystoneJS{' '}
      </span>
    </Link>
    <span
      css={{
        display: 'inline-block',
        color: colors.N40,
        fontStyle: 'italic',
        marginLeft: '1.5em',
        textDecoration: 'underline',
      }}
    >
      v5.x alpha
    </span>
  </div>
);
const NavItem = ({ as, lgOnly, ...props }) => {
  const Tag = props.to ? Link : as;
  return (
    <li>
      <Tag
        href="https://github.com/keystonejs/keystone-5"
        css={{
          alignItems: 'center',
          background: 0,
          border: 0,
          color: colors.N60,
          cursor: 'pointer',
          display: 'flex',
          outline: 0,
          padding: `${gridSize / 2}px ${gridSize}px`,
          textDecoration: 'none',

          [mediaMax.xs]: {
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
      <NavItem
        href="https://github.com/keystonejs/keystone-5"
        title="Opens in new window"
        target="_blank"
      >
        GitHub
        <NewWindowIcon />
      </NavItem>
      {toggleMenu && (
        <NavItem
          as="button"
          onClick={toggleMenu}
          css={{
            [media.sm]: { display: 'none' },
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
const NewWindowIcon = () => (
  <span css={{ marginLeft: gridSize / 2, opacity: 0.6 }}>
    <svg x="0px" y="0px" viewBox="0 0 100 100" width="15" height="15" className="css-19vhmgv">
      <path
        fill="currentColor"
        d="
      M18.8,85.1h56l0,0c2.2,0,4-1.8,4-4v-32h-8v28h-48v-48h28v-8h-32l0,
      0c-2.2,0-4,1.8-4,4v56C14.8,83.3,16.6,85.1,18.8,85.1z
    "
      />
      <polygon
        fill="currentColor"
        points="
      45.7,48.7 51.3,54.3 77.2,28.5 77.2,37.2 85.2,37.2 85.2,14.9 62.8,
      14.9 62.8,22.9 71.5,22.9
      "
      />
    </svg>
  </span>
);

// ==============================
// Data
// ==============================

const NAV_LINKS = [
  {
    name: 'Quick Start',
    url: '/quick-start/',
  },
  {
    name: 'Guides',
    url: '/guides/',
  },
  {
    name: 'API',
    url: '/api/',
  },
  {
    name: 'Packages',
    url: '/packages/',
  },
];
