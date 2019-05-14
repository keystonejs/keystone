import React from 'react';
import Navbar from '../components/Navbar';
import { colors } from '../theme';

export default function About() {
  return (
    <div>
      <Navbar background="white" foreground={colors.greyDark} />
      <h1>About Page</h1>
    </div>
  );
}
