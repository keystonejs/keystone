/** @jsx jsx */

import getConfig from 'next/config';
import { jsx } from '@emotion/core';

import { Link } from '../../routes';
import { useAuth } from '../lib/authetication';
import { colors, fontSizes, gridSize } from '../theme';

const { publicRuntimeConfig } = getConfig();

const NavLink = props => (
  <a
    css={{
      color: props.foreground,
      fontSize: fontSizes.md,
      margin: gridSize * 3,
      textDecoration: 'none',

      ':hover': {
        textDecoration: 'underline',
      },
    }}
    {...props}
  />
);

const NavText = props => (
  <a
    css={{
      color: colors.greyLight,
      fontSize: fontSizes.md,
      margin: gridSize * 3,
    }}
    {...props}
  />
);

const Header = props => (
  <header
    css={{
      background: props.background,
      display: 'flex',
      alignItems: 'center',
      padding: `0 ${gridSize * 6}px`,
    }}
    {...props}
  />
);

// TODO: Implement log out
const UserActions = ({ user }) => (
  <div>
    <NavText>
      Logged in as <strong css={{ color: 'white' }}>{user.name}</strong>
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

const AnonActions = ({ foreground }) => (
  <div>
    <Link route="signin" passHref>
      <NavLink foreground={foreground}>Sign in</NavLink>
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

const Navbar = ({ foreground = 'white', background = colors.greyDark, ...props }) => {
  const { meetup } = publicRuntimeConfig;
  const { isAuthenticated, user } = useAuth();

  return (
    <Header background={background} {...props}>
      <img
        src={meetup.logo.src}
        width={meetup.logo.width}
        height={meetup.logo.height}
        alt={meetup.name}
        css={{ marginRight: gridSize * 2 }}
      />
      <div css={{ flex: 1 }}>
        <Link route="/" passHref>
          <NavLink foreground={foreground}>Home</NavLink>
        </Link>
        <Link route="about" passHref>
          <NavLink foreground={foreground}>About</NavLink>
        </Link>
        <Link route="events" passHref>
          <NavLink foreground={foreground}>Events</NavLink>
        </Link>
      </div>
      {isAuthenticated ? <UserActions user={user} /> : <AnonActions foreground={foreground} />}
    </Header>
  );
};

export default Navbar;
