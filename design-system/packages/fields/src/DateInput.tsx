/** @jsx jsx */

import React, { InputHTMLAttributes, forwardRef, useState } from 'react';
import { jsx } from '@keystone-ui/core';
import { useInputTokens, useInputStyles } from '..';

import { isDate } from './utils/isDate';
import { formatDateType } from './utils/dateFormatters';
import { DateType } from './types';

export type DateInputValue = string | undefined;

/**
 * Ensure the DateInputValue is santised to DateRaw correctly
 */
const formatValue = (value: DateInputValue): DateType => {
  // validate
  if (value === undefined || value === null || !isDate(value)) {
    return '';
  }
  // format
  return formatDateType(new Date(value));
};

type InvalidProps = 'onChange' | 'placeholder' | 'size' | 'type' | 'value';

export type DateInputProps = {
  invalid?: boolean;
  size?: 'small' | 'medium';
  value: string;
  onUpdate: (value: DateType) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, InvalidProps>;

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  (
    { invalid = false, size = 'medium', value, onUpdate, onChange, onBlur, ...props }: DateInputProps,
    ref
  ) => {
    const [controlledValue, setControlledValue] = useState<DateType>(formatValue(value));

    const tokens = useInputTokens({ size });
    const styles = useInputStyles({ invalid, tokens });

    return (
      <input
        aria-invalid={invalid}
        ref={ref}
        css={styles}
        value={controlledValue === null ? '' : controlledValue}
        onChange={(event) => {
          const newControlledValue = event.target.value;
          console.log({ controlledValue, newControlledValue });
          if (controlledValue !== newControlledValue) {
            setControlledValue(newControlledValue);
            if (onChange) {
              onChange(event);
            }
          }
        }}
        onBlur={(event) => {
          onUpdate(formatValue(event.target.value));
          if (!event.defaultPrevented) {
             if (onBlur) {
               onBlur(event);
             }
          }
        }}
        placeholder="dd/mm/yyyy"
        {...props}
      />
    );
  }
);
