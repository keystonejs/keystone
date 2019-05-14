/** @jsx jsx */

import { useContext, createContext } from 'react';
import getConfig from 'next/config';
import { jsx } from '@emotion/core';

import { Link } from '../../routes';
import { useAuth } from '../lib/authetication';
import { colors, fontSizes, gridSize } from '../theme';

const ThemeContext = createContext();

const { publicRuntimeConfig } = getConfig();

const NavLink = props => {
  const { foreground } = useContext(ThemeContext);
  return (
    <a
      css={{
        color: foreground,
        fontSize: fontSizes.sm,
        margin: gridSize * 3,
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
        fontSize: fontSizes.md,
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
        padding: `0 ${gridSize * 6}px`,
      }}
      {...props}
    />
  );
};

// TODO: Implement log out
const UserActions = ({ user }) => (
  <div>
    <NavText>
      Logged in as <strong>{user.name}</strong>
    </NavText>
    {user.isAdmin && (
      <NavLink href="/admin" target="_blank">
        Open the Admin UI
      </NavLink>
    )}
    <Link route="signout" passHref>
      <NavLink>Sign Out</NavLink>
    </Link>
  </div>
);

const AnonActions = () => (
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
        backgroundColor: colors.yellow,
        color: colors.greyDark,
        lineHeight: 1,
      }}
    >
      Join
    </NavLink>
  </div>
);

const Navbar = ({ foreground = colors.greyDark, background = 'white', ...props }) => {
  const { meetup } = publicRuntimeConfig;
  const { isAuthenticated, user } = useAuth();

  return (
    <ThemeContext.Provider value={{ background, foreground }}>
      <Header {...props}>
        <img
          src={meetup.logo.src}
          width={meetup.logo.width}
          height={meetup.logo.height}
          alt={meetup.name}
          css={{ marginRight: gridSize * 2 }}
        />
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
