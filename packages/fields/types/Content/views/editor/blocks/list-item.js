import React from 'react';

export let type = 'list-item';

export function renderNode({ attributes, children }) {
  return <li {...attributes}>{children}</li>;
}
