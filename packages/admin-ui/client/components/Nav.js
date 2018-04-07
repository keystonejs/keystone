import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => (
  <div>
    <Link to="/admin">Home</Link>
    {' • '}
    <Link to="/admin/list">List</Link>
    {' • '}
    <Link to="/admin/list/item">Item</Link>
    {' • '}
    <Link to="/admin/signin">Sign Out</Link>
  </div>
);

export default Home;
