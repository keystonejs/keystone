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
      color: colors.greyDark,
      fontSize: fontSizes.md,
      border: `1px solid ${colors.greyDark}`,
      margin: `${gridSize / 2}px 0`,
      borderRadius: borderRadius,
      padding: `${gridSize}px`,
    }}
    {...props}
  />
);

export const Button = props => (
  <button
    css={{
      color: colors.greyDark,
      backgroundColor: colors.greyLight,
      fontSize: fontSizes.md,
      margin: `${gridSize / 2}px 0`,
      border: 0,
      borderRadius: borderRadius,
      padding: `${gridSize * 1.5}px ${gridSize * 2}px`,
    }}
    {...props}
  />
);
