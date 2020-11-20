/** @jsx jsx */

import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { formatISO, parse } from 'date-fns';
import { jsx, wrapHandlers } from '@keystone-ui/core';
import { useInputTokens, useInputStyles } from '@keystone-ui/fields';

import { ISODate } from './types';
import { formatDateObj } from './utils/formatDateObj';

function getExternalValueForInput(str: string) {
  let parsed = parseDate(str);
  if (Number.isNaN(parsed.valueOf())) {
    return undefined;
  }
  return formatISO(parsed, { representation: 'date' }) as ISODate;
}

function parseDate(str: string) {
  return parse(str, 'dd/MM/yyyy', new Date());
}

function formatValue(value: ISODate | undefined) {
  return value === undefined ? '' : formatDateObj(new Date(value));
}

type InvalidProps = 'onChange' | 'placeholder' | 'size' | 'type' | 'value';
export type DateInputProps = {
  invalid?: boolean;
  onChange: (value: ISODate | undefined) => void;
  size?: 'small' | 'medium';
  value: ISODate | undefined;
} & Omit<InputHTMLAttributes<HTMLInputElement>, InvalidProps>;

// we're using a regular input instead of an input with type=date
// because type=date doesn't work in Safari for Mac
// and type=date in browsers that do support it is hard to use
// because it masks the value while typing

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      invalid = false,
      size = 'medium',
      value,
      onChange,
      onBlur,
      ...props
    }: DateInputProps,
    ref
  ) => {
    let [internalValue, setInternalValue] = useState(formatValue(value));

    if (getExternalValueForInput(internalValue) !== value) {
      setInternalValue(formatValue(value));
    }

    const tokens = useInputTokens({ size });
    const styles = useInputStyles({ invalid, tokens });

    return (
      <input
        aria-invalid={invalid}
        ref={ref}
        css={styles}
        value={internalValue}
        onChange={(event) => {
          setInternalValue(event.target.value);
          let externalValue = getExternalValueForInput(event.target.value);
          if (externalValue !== value) {
            onChange(externalValue);
          }
        }}
        onBlur={wrapHandlers(onBlur, () => {
          setInternalValue(formatValue(value));
        })}
        placeholder="dd/mm/yyyy"
        {...props}
      />
    );
  }
);
