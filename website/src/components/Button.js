/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { Link } from 'gatsby';
import { jsx } from '@emotion/core';
import { colors } from '@arch-ui/theme';

export default Styled.a(props => ({
  textDecoration: 'none',
  boxSizing: 'border-box',
  fontSize: '1.1rem',
  padding: '1rem 3rem',
  borderRadius: 12,
  margin: '0.5rem',
  transition: 'transform linear 120ms',
  '&:hover': {
    transform: 'scale(1.025)',
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

  border:
    props.appearance === 'primary-light' ? `2px solid rgba(255,255,255,0.6);` : `2px solid #007AFF`,

  background:
    {
      'primary-light': 'white',
      primary: '#007AFF',
    }[props.appearance] || 'none',

  color: props.appearance === 'primary' || props.appearance === 'light' ? 'white' : '#007AFF',
}));
