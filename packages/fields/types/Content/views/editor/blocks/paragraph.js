import React from 'react';

export let type = 'paragraph';

export function Node({ attributes, children }) {
  return <p {...attributes}>{children}</p>;
}
