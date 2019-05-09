import React from 'react';
import { Link } from '../../routes';

const navbar = () => (
  <header>
    <Link route="/"><a>Home</a></Link>
    <Link route="about"><a>About</a></Link>
    <Link route="events"><a>Events</a></Link>
  </header>
);

export default navbar;
