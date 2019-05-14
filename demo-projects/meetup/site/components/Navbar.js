import React from 'react';
import getConfig from 'next/config';

import { Link } from '../../routes';
import { useAuth } from '../lib/authetication';

const { publicRuntimeConfig } = getConfig();

const UserActions = ({ user }) => <div>Logged in as {user.name} Sign Out</div>;
const AnonActions = () => <div>Sign In</div>;

const Navbar = () => {
  const { meetup } = publicRuntimeConfig;
  const { isAuthenticated, user } = useAuth();

  return (
    <header>
      {meetup.name}
      <Link route="/">
        <a>Home</a>
      </Link>
      <Link route="about">
        <a>About</a>
      </Link>
      <Link route="events">
        <a>Events</a>
      </Link>
      {isAuthenticated ? <UserActions user={user} /> : <AnonActions />}
    </header>
  );
};

export default Navbar;
