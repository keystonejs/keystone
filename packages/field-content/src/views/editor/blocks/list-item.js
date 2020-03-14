import React from 'react';

export const type = 'list-item';

export const Node = ({ attributes, children }) => {
  return <li {...attributes}>{children}</li>;
}
