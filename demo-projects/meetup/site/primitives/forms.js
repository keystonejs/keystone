/** @jsx jsx */

import { jsx } from '@emotion/core';

import { colors, fontSizes, gridSize, borderRadius } from '../theme';

export const Label = props => (
  <label css={{ display: 'block', color: colors.greyDark, fontSize: fontSizes.md }} {...props} />
);

export const Field = props => (
  <div css={{ color: colors.greyDark, marginBottom: gridSize }} {...props} />
);

export const Input = props => (
  <input
    css={{
      backgroundColor: colors.greyLight,
      border: `1px solid ${colors.greyLight}`,
      borderRadius: borderRadius,
      color: colors.greyDark,
      fontSize: fontSizes.md,
      margin: `${gridSize / 2}px 0`,
      padding: `${gridSize * 1.5}px ${gridSize * 2}px`,
      outline: 0,

      ':focus': {
        backgroundColor: 'white',
        boxShadow: `inset 0 1px 2px rgba(0, 0, 0, 0.1)`,
        borderColor: 'rgba(0, 0, 0, 0.2)',
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
      fontSize: fontSizes.md,
      margin: `${gridSize / 2}px 0`,
      padding: `${gridSize * 1.5}px ${gridSize * 2}px`,
    }}
    {...props}
  />
);
