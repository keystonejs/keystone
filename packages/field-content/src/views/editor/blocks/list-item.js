import React from 'react';

export const type = 'list-item';

export function Node({ attributes, children }) {
  return <li {...attributes}>{children}</li>;
}
