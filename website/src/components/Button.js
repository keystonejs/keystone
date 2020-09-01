/** @jsx jsx */

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
  link: {
    default: {
      color: colors.N80,

      '&:hover': {
        textDecoration: 'underline',
      },
    },
    primary: {
      color: colors.B.base,

      '&:hover': {
        textDecoration: 'underline',
      },
    },
  },
  solid: {
    default: {
      backgroundColor: colors.N80,
      color: 'white',
      transition: 'background-color 150ms',

      '&:hover': {
        backgroundColor: colors.N70,
        textDecoration: 'none',
      },
    },
    primary: {
      backgroundColor: colors.B.base,
      color: 'white',
      transition: 'background-color 150ms',

      '&:hover': {
        backgroundColor: colors.B.L10,
        textDecoration: 'none',
      },
    },
  },
};

export const Button = ({ appearance = 'default', variant = 'hollow', as = 'button', ...props }) => {
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
        borderRadius: '0.66rem',
        boxSizing: 'border-box',
        cursor: 'pointer',
        fontWeight: 500,
        padding: '0.85rem 1.85rem',
        textDecoration: 'none',

        // '&:active': {
        //   transform: 'scale(0.97)',
        // },

        ...dynamicStyles,
      }}
      {...props}
    />
  );
};
