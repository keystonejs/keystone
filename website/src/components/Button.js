/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { Link } from 'gatsby';
import { jsx } from '@emotion/core';
import { colors } from '@arch-ui/theme';

// TODO
const styles = {
  primary: {},
};

export const Button = ({ appearance, as, ...props }) => {
  let Tag = as;
  if (props.href) {
    Tag = 'a';
  } else if (props.to) {
    Tag = Link;
  }

  return (
    <Tag
      css={{
        borderRadius: 6,
        boxSizing: 'border-box',
        cursor: 'pointer',
        fontSize: '1.1rem',
        margin: '0.5rem',
        padding: '1rem 1.5rem',
        textDecoration: 'none',
        transition: 'transform linear 120ms',

        '&:hover': {
          transform: 'scale(1.025)',
        },
        '&:active': {
          opacity: 0.8,
        },

        border:
          appearance === 'primary-light'
            ? `2px solid rgba(255,255,255,0.6);`
            : `2px solid ${colors.B.base}`,

        background:
          {
            'primary-light': 'white',
            primary: colors.B.base,
          }[appearance] || 'none',

        color: appearance === 'primary' || appearance === 'light' ? 'white' : colors.B.base,
      }}
      {...props}
    />
  );
};
Button.defaultProps = {
  as: 'button',
};
