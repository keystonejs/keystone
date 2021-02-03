/* @jsx jsx */
import { InputHTMLAttributes, forwardRef } from 'react';
import { jsx } from '@keystone-ui/core';

import { useInputStyles, useInputTokens } from './hooks/inputs';
import type { SizeType, WidthType } from './types';

type InputProps = InputHTMLAttributes<HTMLTextAreaElement>;

export type TextAreaProps = {
  invalid?: boolean;
  size?: SizeType;
  width?: WidthType;
  onChange?: NonNullable<InputProps['onChange']>;
  value?: NonNullable<InputProps['value']>;
} & Omit<InputProps, 'onChange' | 'size' | 'value'>;

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ invalid = false, size = 'medium' as const, width = 'large' as const, ...props }, ref) => {
    const tokens = useInputTokens({ size, width, shape: 'square', isMultiline: true });
    const styles = useInputStyles({ invalid, tokens });

    return <textarea rows={4} ref={ref} css={styles} {...props} />;
  }
);
