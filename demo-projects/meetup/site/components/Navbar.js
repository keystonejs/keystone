/** @jsx jsx */

import { useContext, createContext } from 'react';
import getConfig from 'next/config';
import { jsx } from '@emotion/core';

import { Link } from '../../routes';
import { useAuth } from '../lib/authetication';
import { SignoutIcon } from '../primitives';
import { getForegroundColor } from '../helpers';
import { mq } from '../helpers/media';
import { colors, fontSizes, gridSize } from '../theme';

const ThemeContext = createContext();
const useTheme = () => useContext(ThemeContext);

const { publicRuntimeConfig } = getConfig();

const NavAnchor = props => {
  const { foreground } = useTheme();
  const paddingHorizontal = [gridSize, gridSize, gridSize * 3];
  const paddingVertical = [gridSize, gridSize * 3];

  return (
    <a
      css={mq({
        color: foreground,
        display: 'inline-block',
        fontSize: fontSizes.sm,
        paddingLeft: paddingHorizontal,
        paddingRight: paddingHorizontal,
        paddingBottom: paddingVertical,
        paddingTop: paddingVertical,
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
  return <span css={{ color: foreground, fontSize: fontSizes.sm }} {...props} />;
};

const Header = props => {
  const { background } = useTheme();
  const paddingHorizontal = [gridSize * 2, gridSize * 6];

  return (
    <header
      css={mq({
        alignItems: 'center',
        background: background,
        display: 'flex',
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
    {user.isAdmin && (
      <NavAnchor css={hideOnMobile} href="/admin" target="_blank">
        Admin
      </NavAnchor>
    )}
    <span css={{ alignItems: 'center', display: 'inline-flex' }}>
      <NavText css={hideOnMobile}>
        <strong>{user.name}</strong>
      </NavText>
      <NavLink route="signout" title="Sign Out">
        <SignoutIcon />
      </NavLink>
    </span>
  </div>
);

const AnonActions = () => {
  const { meetup } = publicRuntimeConfig;
  return (
    <div>
      <NavLink route="signin">Sign in</NavLink>
      <NavLink
        route="signup"
        css={mq({
          backgroundColor: meetup.themeColor,
          border: 'none',
          borderRadius: 40,
          color: getForegroundColor(meetup.themeColor),
          fontWeight: 600,
          lineHeight: 1,
          marginRight: [0, 0],
          padding: '.9rem 2rem',
        })}
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
