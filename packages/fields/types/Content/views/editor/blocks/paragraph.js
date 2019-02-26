/** @jsx jsx */
import { jsx } from '@emotion/core';

export let type = 'paragraph';

export function Node({ attributes, children }) {
  return (
    <p
      {...attributes}
      css={{
        ':first-of-type': { marginTop: 0 },
        ':last-of-type': { marginBottom: 0 },
      }}
    >
      {children}
    </p>
  );
}
