/* @jsx jsx */

/**
 * TODO
 *
 * - Support icons in the input (search, etc)
 */

import { InputHTMLAttributes, forwardRef } from 'react';
import { jsx } from '@keystone-ui/core';

import { useInputStyles, useInputTokens } from './hooks/inputs';
import type { ShapeType, SizeType, WidthType } from './types';

const validTypes = {
  email: 'email',
  number: 'number',
  password: 'password',
  search: 'search',
  tel: 'tel',
  text: 'text',
  url: 'url',
};

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export type TextInputProps = {
  invalid?: boolean;
  shape?: ShapeType;
  size?: SizeType;
  width?: WidthType;
  type?: keyof typeof validTypes;
  onChange?: NonNullable<InputProps['onChange']>;
  value?: NonNullable<InputProps['value']>;
} & Omit<InputProps, 'onChange' | 'type' | 'size' | 'value'>;

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      invalid = false,
      shape = 'square' as const,
      size = 'medium' as const,
      type = 'text',
      width = 'large',
      ...props
    },
    ref
  ) => {
    const tokens = useInputTokens({ size, width, shape });
    const styles = useInputStyles({ invalid, tokens });

    return <input ref={ref} type={type} css={styles} {...props} />;
  }
);
