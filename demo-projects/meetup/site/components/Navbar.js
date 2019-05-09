import React from 'react';
import Link from './Link';

const navbar = () => (
  <header>
    <Link to='/'>Home</Link>
    <Link to='/about'>About</Link>
    <Link to='/events'>Events</Link>
  </header>
);

export default navbar;