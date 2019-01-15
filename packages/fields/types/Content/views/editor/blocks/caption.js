/** @jsx jsx */
import { jsx } from '@emotion/core';

export let type = 'caption';

export function Node(props) {
  return (
    <figcaption css={{ padding: 8, textAlign: 'center' }} {...props.attributes}>
      {props.children}
    </figcaption>
  );
}
