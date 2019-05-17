/** @jsx jsx */

import { useContext, createContext } from 'react';
import getConfig from 'next/config';
import contrast from 'get-contrast';
import { jsx } from '@emotion/core';

import { Link } from '../../routes';
import { useAuth } from '../lib/authetication';
import { getBreakpoints } from '../helpers';
import { colors, fontSizes, gridSize } from '../theme';

const mq = getBreakpoints();
const ThemeContext = createContext();

const { publicRuntimeConfig } = getConfig();

const NavLink = props => {
  const { foreground } = useContext(ThemeContext);
  return (
    <a
      css={{
        color: foreground,
        fontSize: fontSizes.sm,
        margin: gridSize,
        [mq[0]]: {
          margin: gridSize * 3,
        },
        textDecoration: 'none',

        ':hover': {
          textDecoration: 'underline',
        },
      }}
      {...props}
    />
  );
};

const NavText = props => {
  const { foreground } = useContext(ThemeContext);
  return (
    <a
      css={{
        color: foreground,
        fontSize: fontSizes.sm,
        margin: gridSize * 3,
      }}
      {...props}
    />
  );
};

const Header = props => {
  const { background } = useContext(ThemeContext);
  return (
    <header
      css={{
        background: background,
        display: 'flex',
        alignItems: 'center',
        padding: `0 ${gridSize * 2}px`,
        [mq[0]]: {
          padding: `0 ${gridSize * 6}px`,
        },
      }}
      {...props}
    />
  );
};

const hideOnMobile = {
  display: 'none',
  [mq[2]]: {
    display: 'initial',
  },
};

// TODO: Implement log out
const UserActions = ({ user }) => (
  <div>
    <NavText css={hideOnMobile}>
      Logged in as <strong>{user.name}</strong>
    </NavText>
    {user.isAdmin && (
      <NavLink css={hideOnMobile} href="/admin" target="_blank">
        Open the Admin UI
      </NavLink>
    )}
    <Link route="signout" passHref>
      <NavLink>Sign Out</NavLink>
    </Link>
  </div>
);

const AnonActions = () => {
  const { meetup } = publicRuntimeConfig;
  return (
    <div>
      <Link route="signin" passHref>
        <NavLink>Sign in</NavLink>
      </Link>
      <NavLink
        href="/"
        css={{
          borderRadius: 40,
          border: 'none',
          fontWeight: 600,
          padding: '.9rem 2rem',
          backgroundColor: meetup.themeColor,
          color:
            contrast.ratio(colors.greyDark, meetup.themeColor) >
            contrast.ratio(colors.greyLight, meetup.themeColor)
              ? colors.greyDark
              : 'white',
          lineHeight: 1,
        }}
      >
        Join
      </NavLink>
    </div>
  );
};

const Navbar = ({ foreground = colors.greyDark, background = 'white', ...props }) => {
  const { meetup } = publicRuntimeConfig;
  const { isAuthenticated, user } = useAuth();

  return (
    <ThemeContext.Provider value={{ background, foreground }}>
      <Header {...props}>
        <Link route="/" passHref>
          <a>
            <img
              src={meetup.logo.src}
              width={meetup.logo.width}
              height={meetup.logo.height}
              alt={meetup.name}
              css={{
                marginRight: gridSize,
                width: meetup.logo.width / 1.5,
                height: meetup.logo.height / 1.5,
                [mq[0]]: {
                  marginRight: gridSize * 2,
                  width: meetup.logo.width,
                  height: meetup.logo.height,
                },
              }}
            />
          </a>
        </Link>
        <div css={{ flex: 1 }}>
          <Link route="/" passHref>
            <NavLink>Home</NavLink>
          </Link>
          <Link route="about" passHref>
            <NavLink>About</NavLink>
          </Link>
          <Link route="events" passHref>
            <NavLink>Events</NavLink>
          </Link>
        </div>
        {isAuthenticated ? <UserActions user={user} /> : <AnonActions />}
      </Header>
    </ThemeContext.Provider>
  );
};

export default Navbar;
