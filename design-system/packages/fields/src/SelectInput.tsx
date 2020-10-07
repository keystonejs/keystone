/** @jsx jsx */

import { ChangeEvent } from 'react';
import { jsx, useTheme } from '@keystone-ui/core';
import { ChevronDownIcon } from '@keystone-ui/icons/icons/ChevronDownIcon';
import { useInputStyles, useInputTokens } from './hooks/inputs';
import { ShapeType, SizeType, WidthType } from './types';

export type BaseOption = {
  readonly value: string;
  readonly label: string;
};

export type SelectInputProps<Option extends BaseOption> = {
  disabled?: boolean;
  id?: string;
  invalid?: boolean;
  isClearable?: boolean;
  onChange: (value: Option['value'] | undefined) => void;
  options: readonly Option[];
  placeholder?: string;
  value: Option['value'] | undefined;
  shape?: ShapeType;
  size?: SizeType;
  width?: WidthType;
};

export const SelectInput = <Option extends BaseOption>({
  disabled = false,
  invalid = false,
  isClearable = false,
  shape = 'square' as const,
  size = 'medium' as const,
  width = 'large',
  onChange,
  options,
  placeholder,
  value,
  ...props
}: SelectInputProps<Option>) => {
  const { colors, spacing } = useTheme();
  const tokens = useInputTokens({ size, width, shape, fixHeight: true });
  const styles = useInputStyles({ invalid, tokens });

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    let val = event.target.value;
    onChange(val === '' ? undefined : val);
  };

  return (
    <div
      css={{
        alignItems: 'center',
        display: 'flex',
        position: 'relative',
        maxWidth: styles.maxWidth,
      }}
    >
      <select
        disabled={disabled}
        value={value || ''}
        onChange={handleChange}
        css={{
          ...styles,
          color: value ? colors.foreground : colors.foregroundMuted,
          lineHeight: undefined,
        }}
        {...props}
      >
        <option value="" disabled={!isClearable}>
          {placeholder}
        </option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span
        css={{
          pointerEvents: 'none',
          position: 'absolute',
          right: spacing.medium,
          top: spacing.small,
        }}
      >
        <ChevronDownIcon />
      </span>
    </div>
  );
};
