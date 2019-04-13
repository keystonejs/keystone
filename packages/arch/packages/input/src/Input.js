// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { forwardRef } from 'react';

import { uniformHeight } from '@arch-ui/common';
import { colors } from '@arch-ui/theme';
// import { alpha } from '@arch-ui/color-utils';

// Basic Input
// ------------------------------

export const inputStyles = (props: InputProps = {}) => ({
  ...uniformHeight,
  backgroundColor: props.disabled ? colors.N10 : 'white',
  borderColor: colors.N20,
  // boxShadow: 'inset 0 1px 1px rgba(0, 0, 0, 0.075)',
  color: 'inherit',
  width: '100%',

  ':hover': {
    borderColor: colors.N30,
    outline: 0,
  },
  ':focus': {
    borderColor: colors.primary,
    // boxShadow: `inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 0 3px ${alpha(colors.primary, 0.2)}`,
    outline: 0,
  },
  '&[disabled]': {
    borderColor: colors.N15,
    // boxShadow: 'none',
    backgroundColor: colors.N05,
  },
  ...(props.isMultiline
    ? {
        lineHeight: 'inherit',
        height: 'auto',
      }
    : undefined),
});

type InputProps = { isMultiline?: boolean, disabled?: boolean };
export const Input = forwardRef<InputProps, any>((props: InputProps, ref) => {
  const Component = props.isMultiline ? 'textarea' : 'input';
  return <Component ref={ref} css={inputStyles(props)} {...props} />;
});
