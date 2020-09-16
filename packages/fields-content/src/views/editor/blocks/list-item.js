import React from 'react';

export let type = 'list-item';

export function Node({ attributes, children }) {
  return <li {...attributes}>{children}</li>;
}
