/** @jsx jsx */

import { useContext, createContext } from 'react';
import getConfig from 'next/config';
import { jsx } from '@emotion/core';

import { Link } from '../../routes';
import { useAuth } from '../lib/authetication';
import { getForegroundColor } from '../helpers';
import { mq } from '../helpers/media';
import { colors, fontSizes, gridSize } from '../theme';

const ThemeContext = createContext();
const useTheme = () => useContext(ThemeContext);

const { publicRuntimeConfig } = getConfig();

const NavAnchor = props => {
  const { foreground } = useTheme();

  return (
    <a
      css={mq({
        color: foreground,
        fontSize: fontSizes.sm,
        margin: [gridSize, gridSize * 3],
        textDecoration: 'none',

        ':hover': {
          textDecoration: 'underline',
        },
      })}
      {...props}
    />
  );
};
const NavLink = ({ route, ...props }) => (
  <Link route={route} passHref>
    <NavAnchor {...props} />
  </Link>
);

const NavText = props => {
  const { foreground } = useTheme();
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
  const { background } = useTheme();
  const paddingHorizontal = [gridSize * 2, gridSize * 6];

  return (
    <header
      css={mq({
        background: background,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: paddingHorizontal,
        paddingRight: paddingHorizontal,
      })}
      {...props}
    />
  );
};

const hideOnMobile = mq({
  display: ['none', 'none', 'initial'],
});

// TODO: Implement log out
const UserActions = ({ user }) => (
  <div>
    <NavText css={hideOnMobile}>
      Logged in as <strong>{user.name}</strong>
    </NavText>
    {user.isAdmin && (
      <NavAnchor css={hideOnMobile} href="/admin" target="_blank">
        Open the Admin UI
      </NavAnchor>
    )}
    <NavLink route="signout">Sign Out</NavLink>
  </div>
);

const AnonActions = () => {
  const { meetup } = publicRuntimeConfig;
  return (
    <div>
      <NavLink route="signin">Sign in</NavLink>
      <NavAnchor
        href="/"
        css={{
          borderRadius: 40,
          border: 'none',
          fontWeight: 600,
          padding: '.9rem 2rem',
          backgroundColor: meetup.themeColor,
          color: getForegroundColor(meetup.themeColor),
          lineHeight: 1,
        }}
      >
        Join
      </NavAnchor>
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
              css={mq({
                marginRight: [gridSize, gridSize * 2],
                width: [meetup.logo.width / 1.5, meetup.logo.width],
                height: [meetup.logo.height / 1.5, meetup.logo.height],
              })}
            />
          </a>
        </Link>
        <div css={{ flex: 1 }}>
          <NavLink route="/">Home</NavLink>
          <NavLink route="about">About</NavLink>
          <NavLink route="events">Events</NavLink>
        </div>
        {isAuthenticated ? <UserActions user={user} /> : <AnonActions />}
      </Header>
    </ThemeContext.Provider>
  );
};

export default Navbar;
