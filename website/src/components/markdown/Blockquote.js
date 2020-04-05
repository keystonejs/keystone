/** @jsx jsx */

import { jsx } from '@emotion/core';
import { colors } from '@arch-ui/theme';

export function Blockquote(props) {
  let variant = getVariant(props);
  let lineColor = variants[variant];

  return (
    <blockquote
      css={{
        margin: `1.66rem 0`,
        padding: '0.5rem 1rem',
        position: 'relative',

        '::before': {
          background: lineColor,
          borderRadius: 4,
          content: '" "',
          height: '100%',
          left: '0',
          position: 'absolute',
          top: '0',
          width: 4,
        },

        strong: {
          color: colors.N100,
        },

        '& > p:first-of-type': {
          marginTop: 0,
        },
        '& > p:last-of-type': {
          marginBottom: 0,
        },
      }}
      {...props}
    />
  );
}

// Utils
// ------------------------------

function getFirstLeaf(children) {
  if (typeof children === 'string') {
    return children;
  }

  // many children
  if (Array.isArray(children)) {
    if (typeof children[0] === 'string') {
      return children[0];
    }

    return getFirstLeaf(children[0].props.children);
  }

  // single child
  return getFirstLeaf(children.props.children);
}
function getVariant(props) {
  let variant = variantKeys[0];
  let text = getFirstLeaf(props.children);

  variantKeys.forEach(key => {
    if (text.toLowerCase().includes(key)) {
      variant = key;
    }
  });

  return variant;
}

let variants = {
  __standard: colors.N20,
  hint: colors.B.L50,
  tip: colors.B.L50,
  note: colors.B.base,
  important: colors.Y.base,
};
let variantKeys = Object.keys(variants);
