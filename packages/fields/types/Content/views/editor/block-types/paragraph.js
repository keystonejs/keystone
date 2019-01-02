import React from 'react';

export let type = 'paragraph';

export function renderNode({ attributes, children }) {
  return <p {...attributes}>{children}</p>;
}
