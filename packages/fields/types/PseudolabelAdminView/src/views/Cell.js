import React from 'react';

export const PseudolabelCell = ({ itemId, list, data, Link }) => (
  <Link path={list.path} id={itemId}>
    {data}
  </Link>
);
