/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Children } from 'react';
import NextLink from 'next/link';

import { colors, gridSize, borderRadius } from '../theme';

export const Label = props => (
  <div>
    <label css={{ color: colors.greyDark }} {...props} />
  </div>
);

export const Field = props => (
  <div css={{ color: colors.greyDark, marginBottom: gridSize }} {...props} />
);

export const Input = props => (
  <input
    css={{
      background: 0,
      border: '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: borderRadius,
      boxSizing: 'border-box',
      color: colors.greyDark,
      fontSize: 'inherit',
      margin: `${gridSize / 2}px 0`,
      outline: 0,
      padding: `${gridSize * 1.5}px ${gridSize * 2}px`,
      width: '100%',

      ':focus': {
        backgroundColor: 'white',
        borderColor: 'rgba(0, 0, 0, 0.33)',
      },
    }}
    {...props}
  />
);

export const Button = props => (
  <button
    css={{
      backgroundColor: colors.greyDark,
      border: 0,
      borderRadius: borderRadius,
      color: 'white',
      cursor: 'pointer',
      fontSize: 'inherit',
      margin: `${gridSize / 2}px 0`,
      padding: `${gridSize * 1.5}px ${gridSize * 2}px`,
    }}
    {...props}
  />
);

export const Group = ({ children, ...props }) => {
  const gutter = 4;
  return (
    <div
      css={{
        alignItems: 'center',
        display: 'flex',
        marginLeft: -gutter,
        marginRight: -gutter,
      }}
      {...props}
    >
      {Children.map(children, (kid, idx) => (
        <div
          key={idx}
          css={{
            marginLeft: gutter,
            marginRight: gutter,
          }}
        >
          {kid}
        </div>
      ))}
    </div>
  );
};
export const Link = ({ href, as, ...props }) => (
  <NextLink href={href} as={as} passHref>
    <a
      css={{
        color: 'inherit',
        cursor: 'pointer',
        display: 'inline-block',
        padding: `${gridSize * 1.5}px ${gridSize * 2}px`,
        textDecoration: 'none',

        ':hover': {
          textDecoration: 'underline',
        },
      }}
      {...props}
    />
  </NextLink>
);
