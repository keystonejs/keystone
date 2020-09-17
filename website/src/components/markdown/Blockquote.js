/** @jsx jsx */

import { jsx } from '@emotion/core';
import { colors } from '@arch-ui/theme';

export function Blockquote(props) {
  let variant = getVariant(props);
  let { lineColor, isBold } = variants[variant];

  let boldStyles = isBold
    ? {
        backgroundColor: 'white',
        border: `1px solid ${lineColor}`,
        borderRadius: 4,
      }
    : null;

  return (
    <blockquote
      css={{
        fontSize: '1.1rem',
        margin: `1.6rem 0`,
        padding: '0.6rem 2rem',
        position: 'relative',

        '::before': {
          background: lineColor,
          borderRadius: 4,
          content: '" "',
          height: 'calc(100% - 4px)',
          left: 2,
          position: 'absolute',
          top: 2,
          width: 4,
        },

        '& > p:first-of-type': {
          marginTop: 0,
        },
        '& > p:last-of-type': {
          marginBottom: 0,
        },

        a: {
          borderBottomColor: lineColor,
        },

        ...boldStyles,
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
  let firstWord = text.split(' ')[0];

  variantKeys.forEach(key => {
    if (firstWord.toLowerCase() === `${key}:`) {
      variant = key;
    }
  });

  return variant;
}

let variants = {
  __standard: { lineColor: colors.N20, isBold: false },
  note: { lineColor: colors.N20, isBold: true },
  hint: { lineColor: colors.B.base, isBold: true },
  tip: { lineColor: colors.G.base, isBold: true },
  important: { lineColor: colors.Y.base, isBold: true },
  warning: { lineColor: colors.R.base, isBold: true },
};
let variantKeys = Object.keys(variants);
