/** @jsx jsx */

import { forwardRef } from 'react';
import { Link } from 'gatsby';
import { jsx } from '@emotion/core';
import { colors, gridSize } from '@arch-ui/theme';

import logosvg from '../assets/logo.svg';
import { Container, SocialIconsNav, Search } from '../components';
import { SIDEBAR_WIDTH } from '../components/Sidebar';
import { media, mediaMax, mq } from '../utils/media';

export const HEADER_HEIGHT = 60;

export const Header = forwardRef(({ toggleMenu, showSearch = true, ...props }, ref) => (
  <header
    ref={ref}
    css={{
      backgroundColor: colors.page,
      boxShadow: `0 1px 0 ${colors.N10}`,
      position: 'sticky',
      top: 0,
      zIndex: 1,
    }}
    {...props}
  >
    <Container hasGutters={false}>
      <div
        css={{
          alignItems: 'center',
          display: 'flex',
          fontWeight: 500,
          height: HEADER_HEIGHT,
        }}
      >
        {toggleMenu && (
          <button
            onClick={toggleMenu}
            css={{
              background: 0,
              border: 0,
              cursor: 'pointer',
              padding: gridSize * 2,

              [media.md]: { display: 'none' },
            }}
          >
            <svg viewBox="0 0 24 24" focusable="false" width="24" height="24" role="presentation">
              <g
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              >
                <path d="M2.25 18.003h19.5M2.25 12.003h19.5M2.25 6.003h19.5" />
              </g>
            </svg>
          </button>
        )}
        <Logo />
        <div
          css={{
            display: 'flex',
            flex: 1,

            [media.md]: {
              paddingLeft: gridSize * 6,
            },
          }}
        >
          <div
            css={{
              flex: 1,

              [mediaMax.md]: {
                paddingRight: gridSize * 2,
              },
            }}
          >
            {showSearch && <Search />}
          </div>
          <div
            css={{
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: gridSize * 6,
              paddingRight: gridSize * 3,
              width: 280,

              [mediaMax.sm]: {
                display: 'none',
              },
            }}
          >
            <SocialIconsNav />
          </div>
        </div>
      </div>
    </Container>
  </header>
));

// ==============================
// Styled Components
// ==============================

export const Logo = () => (
  <Link
    to="/"
    css={mq({
      alignItems: 'center',
      boxSizing: 'border-box',
      color: 'inherit',
      display: 'inline-flex',
      fontSize: '0.9rem',
      padding: [gridSize * 2, null, gridSize * 3],

      [mediaMax.md]: {
        paddingLeft: 0,
      },
      [media.md]: {
        width: SIDEBAR_WIDTH,
      },

      ':hover': {
        textDecoration: 'none',
        span: {
          textDecoration: 'underline',
        },
      },
    })}
  >
    <img
      alt="KeystoneJS Logo"
      src={logosvg}
      css={mq({
        display: 'block',
        width: [32, null, null, 40],
      })}
    />
    <span
      css={{
        display: 'none',
        marginLeft: '0.66rem',

        [media.md]: {
          display: 'block',
        },
      }}
    >
      KeystoneJS
    </span>
  </Link>
);
