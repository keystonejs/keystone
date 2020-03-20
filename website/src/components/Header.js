/** @jsx jsx */

import { forwardRef } from 'react';
import { Link } from 'gatsby';
import { jsx } from '@emotion/core';
import { colors, gridSize } from '@arch-ui/theme';

import logosvg from '../assets/logo.svg';
import { Container, SocialIconsNav, Search } from '../components';
import { media, mediaOnly, mediaMax } from '../utils/media';

export const HEADER_HEIGHT = 60;

export const Header = forwardRef(({ toggleMenu, ...props }, ref) => (
  <header
    ref={ref}
    css={{
      backgroundColor: 'rgb(250, 251, 252)',
      zIndex: 1,
      [media.sm]: { position: 'sticky', top: 0 },
    }}
    {...props}
  >
    <Container>
      <div
        css={{
          alignItems: 'center',
          boxShadow: `0 1px 0 ${colors.N10}`,
          display: 'grid',
          gridTemplateColumns: '150px 1fr auto',
          gridGap: '1rem',
          fontWeight: 500,
          height: HEADER_HEIGHT,

          [media.sm]: {
            gridTemplateColumns: '220px 1fr 220px',
          },
        }}
      >
        <Logo />
        <Search />
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
        fontSize: '0.9rem',

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
        v5
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
      <li>
        <SocialIconsNav
          css={{
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
