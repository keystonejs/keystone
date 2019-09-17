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
  color: 'inherit',
  width: '100%',

  ':hover': {
    borderColor: colors.N30,
    outline: 0,
  },
  ':focus': {
    borderColor: colors.primary,
    outline: 0,
  },
  '&[disabled]': {
    borderColor: colors.N15,
    backgroundColor: colors.N05,
  },
  ...(props.isMultiline
    ? {
        lineHeight: 'inherit',
        minHeight: 100,
        resize: 'vertical',
        whiteSpace: 'wrap',
      }
    : undefined),
});

type InputProps = { isMultiline?: boolean, disabled?: boolean };
export const Input = forwardRef<InputProps, any>((props: InputProps, ref) => {
  const { isMultiline, ...inputProps } = props;
  const Component = isMultiline ? 'textarea' : 'input';
  return <Component ref={ref} css={inputStyles(props)} {...inputProps} />;
});
