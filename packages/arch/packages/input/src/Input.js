// @flow

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { type Ref } from 'react';

import { buttonAndInputBase } from '../common';
import { colors } from '../theme';
import { alpha } from '../color-utils';

// Basic Input
// ------------------------------

type InputProps = { innerRef: Ref<*>, isMultiline: boolean, disabled: boolean };
export const Input = ({ innerRef, isMultiline, ...props }: InputProps) => {
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
    <textarea ref={innerRef} css={{ ...css, lineHeight: 'inherit', height: 'auto' }} {...props} />
  ) : (
    <input ref={innerRef} css={css} {...props} />
  );
};
