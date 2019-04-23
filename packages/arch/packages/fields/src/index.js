// @flow
/** @jsx jsx */

import { jsx } from '@emotion/core';
import { colors, gridSize } from '@arch-ui/theme';

export const FieldContainer = (props: *) => (
  <div data-selector="field-container" css={{ marginBottom: gridSize * 2 }} {...props} />
);

export const FieldLabel = (props: *) => (
  <label
    css={{
      color: colors.N60,
      display: 'inline-block',
      fontSize: '0.9rem',
      fontWeight: 500,
      paddingBottom: gridSize,
    }}
    {...props}
  />
);

export const FieldInput = (props: *) => (
  <div
    css={{
      display: 'flex',
      maxWidth: 640,
    }}
    {...props}
  />
);

export const Currency = (props: *) => (
  <span
    css={{
      alignContent: 'center',
      backgroundColor: colors.N10,
      border: '1px solid transparent',
      borderBottomRightRadius: 0,
      borderColor: colors.N20,
      borderRadius: 4,
      borderRight: 0,
      borderTopRightRadius: 0,
      display: 'flex',
      fontSize: '0.9rem',
      marginRight: -2,
      padding: 10,
    }}
    {...props}
  />
);
