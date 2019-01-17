// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { type AbstractComponent, forwardRef } from 'react';

import { buttonAndInputBase } from '@arch-ui/common';
import { colors } from '@arch-ui/theme';
import { alpha } from '@arch-ui/color-utils';

// Basic Input
// ------------------------------

type InputProps = { isMultiline?: boolean, disabled?: boolean };
export const Input: AbstractComponent<
  InputProps,
  HTMLInputElement | HTMLTextAreaElement
> = forwardRef(({ isMultiline, ...props }: InputProps, ref) => {
  const css = {
    ...buttonAndInputBase,
    backgroundColor: props.disabled ? colors.N10 : 'white',
    borderColor: colors.N20,
    boxShadow: 'inset 0 1px 1px rgba(0, 0, 0, 0.075)',
    color: 'inherit',
    width: '100%',

    ':hover': {
      borderColor: colors.N30,
      outline: 0,
    },
    ':focus': {
      borderColor: colors.primary,
      boxShadow: `inset 0 1px 1px rgba(0, 0, 0, 0.075),
        0 0 0 3px ${alpha(colors.primary, 0.2)}`,
      outline: 0,
    },
    '&[disabled]': {
      borderColor: colors.N15,
      boxShadow: 'none',
      backgroundColor: colors.N05,
    },
  };
  return isMultiline ? (
    <textarea ref={ref} css={{ ...css, lineHeight: 'inherit', height: 'auto' }} {...props} />
  ) : (
    // $FlowFixMe
    <input ref={ref} css={css} {...props} />
  );
});
