/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { Link } from 'gatsby';
import { jsx } from '@emotion/core';
import { colors } from '@arch-ui/theme';

// TODO
const variants = {
  hollow: {
    default: {
      boxShadow: `inset 0 0 0 2px ${colors.N80}`,
      color: colors.N80,
    },
    primary: {
      boxShadow: `inset 0 0 0 2px ${colors.B.base}`,
      color: colors.B.base,
    },
  },
  solid: {
    default: {
      backgroundColor: colors.N80,
      color: 'white',
    },
    primary: {
      backgroundColor: colors.B.base,
      color: 'white',
    },
  },
};

export const Button = ({ appearance, variant, as, ...props }) => {
  let Tag = as;
  if (props.href) {
    Tag = 'a';
  } else if (props.to) {
    Tag = Link;
  }
  const dynamicStyles = variants[variant][appearance];

  return (
    <Tag
      css={{
        borderRadius: 4,
        boxSizing: 'border-box',
        cursor: 'pointer',
        fontWeight: 500,
        padding: '1rem 1.5rem',
        textDecoration: 'none',
        transition: 'transform ease 120ms',

        '&:hover': {
          transform: 'scale(1.025)',
          textDecoration: 'none',
          // opacity: 0.9,
        },
        '&:active': {
          transform: 'scale(1)',
        },

        ...dynamicStyles,
      }}
      {...props}
    />
  );
};
Button.defaultProps = {
  as: 'button',
  appearance: 'default',
  variant: 'hollow',
};
