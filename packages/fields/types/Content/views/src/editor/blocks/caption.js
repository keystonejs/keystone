/** @jsx jsx */
import { jsx } from '@emotion/core';

export let type = 'caption';

export function Node({ attributes, children }) {
  return (
    <figcaption css={{ padding: 8, textAlign: 'center' }} {...attributes}>
      {children}
    </figcaption>
  );
}
