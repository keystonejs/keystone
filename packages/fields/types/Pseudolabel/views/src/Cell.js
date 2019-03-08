import React from 'react';

export default ({ itemId, list, data, Link }) => (
  <Link path={list.path} id={itemId}>
    {data}
  </Link>
);
