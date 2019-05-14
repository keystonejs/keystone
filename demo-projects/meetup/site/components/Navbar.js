/** @jsx jsx */

import getConfig from 'next/config';
import { jsx } from '@emotion/core';

import { Link } from '../../routes';
import { useAuth } from '../lib/authetication';
import { colors, gridSize } from '../theme';

const { publicRuntimeConfig } = getConfig();

const NavLink = props => (
  <a
    css={{
      color: props.foreground,
      margin: gridSize * 2,
      textDecoration: 'none',

      ':hover': {
        textDecoration: 'underline',
      },
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
  <div css={{ color: colors.greyLight }}>
    Logged in as <strong css={{ color: 'white' }}>{user.name}</strong>
  </div>
);
// TODO: Implement log in
const AnonActions = ({ foreground }) => (
  <div>
    <NavLink foreground={foreground} href="/admin">
      Sign in
    </NavLink>
    <NavLink
      href="/admin"
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
