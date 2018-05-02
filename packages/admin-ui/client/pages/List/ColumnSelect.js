import React from 'react';
import { CheckIcon, DashIcon, XIcon } from '@keystonejs/icons';
import { colors } from '@keystonejs/ui/src/theme';

import FieldAwareSelect, { type SelectProps } from './FieldAwareSelect';
import { OptionPrimitive } from './components';

export const ColumnOption = ({
  children,
  isFocused,
  isSelected,
  innerProps,
  selectProps,
}) => {
  const { removeIsAllowed } = selectProps;

  let Icon;
  let iconColor = !isFocused && !isSelected ? colors.N40 : 'currentColor';
  if (isSelected) {
    Icon = isFocused ? XIcon : CheckIcon;
  } else {
    Icon = isFocused ? CheckIcon : DashIcon;
  }

  return (
    <OptionPrimitive
      isFocused={isFocused}
      isSelected={isSelected}
      {...innerProps}
    >
      <span>{children}</span>
      {isSelected && !removeIsAllowed ? null : (
        <Icon css={{ color: iconColor }} />
      )}
    </OptionPrimitive>
  );
};

export default function ColumnSelect(props: SelectProps) {
  return (
    <FieldAwareSelect
      {...props}
      // onChange={this.handleChange}
      placeholder="Find a field..."
      components={{
        Option: ColumnOption,
      }}
    />
  );
}
