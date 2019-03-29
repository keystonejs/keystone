// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { forwardRef } from 'react';

import { buttonAndInputBase } from '@arch-ui/common';
import { colors } from '@arch-ui/theme';
import { alpha } from '@arch-ui/color-utils';

// Basic Input
// ------------------------------

export const inputStyles = (props: InputProps = {}) => ({
  ...buttonAndInputBase,
  // backgroundColor: props.disabled ? colors.N20 : colors.N10,
  borderColor: colors.N15,
  // boxShadow: 'inset 0 1px 1px rgba(0, 0, 0, 0.075)',
  color: 'inherit',
  width: '100%',

  ':hover': {
    borderColor: colors.N20,
    outline: 0,
  },
  ':focus': {
    // backgroundColor: colors.N20,
    // borderColor: colors.N20,
    borderColor: colors.primary,
    boxShadow: `0 0 0 3px ${alpha(colors.primary, 0.2)}`,
    outline: 0,
  },
  '&[disabled]': {
    borderColor: colors.N15,
    boxShadow: 'none',
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
