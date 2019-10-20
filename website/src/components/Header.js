/** @jsx jsx */

import React, { forwardRef } from 'react'; // eslint-disable-line no-unused-vars
import { Link } from 'gatsby';
import { jsx } from '@emotion/core';
import { colors, gridSize } from '@arch-ui/theme';

import logosvg from '../assets/logo.svg';
import { Container, SocialIconsNav } from '../components';
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
        KeystoneJS
      </span>
      <span
        css={{
          display: 'inline-block',
          color: colors.N40,
          fontStyle: 'italic',
          marginLeft: '0.5em',
        }}
      >
        v5.x alpha
      </span>
    </Link>
  </div>
);
const NavItem = ({ as, lgOnly, ...props }) => {
  const Tag = props.to ? Link : as;
  return (
    <li>
      <Tag
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
      <li>
        <SocialIconsNav
          css={{
            marginLeft: '2rem',
            [mediaMax.sm]: {
              display: 'none',
            },
          }}
        />
      </li>
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
