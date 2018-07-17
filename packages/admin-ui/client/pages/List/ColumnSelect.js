import React from 'react';
import { CheckIcon, DashIcon, XIcon } from '@keystonejs/icons';
import { colors } from '@keystonejs/ui/src/theme';
import { OptionPrimitive } from '@keystonejs/ui/src/primitives/filters';

import { POPOUT_GUTTER } from '../../components/Popout';
import FieldSelect, { type FieldSelectProps } from './FieldSelect';

export const ColumnOption = ({
  children,
  isFocused,
  isSelected,
  selectProps,
  ...props
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
    <OptionPrimitive isFocused={isFocused} isSelected={isSelected} {...props}>
      <span>{children}</span>
      {isSelected && !removeIsAllowed ? null : (
        <Icon css={{ color: iconColor }} />
      )}
    </OptionPrimitive>
  );
};

export default function ColumnSelect(props: FieldSelectProps) {
  return (
    <div css={{ padding: POPOUT_GUTTER }}>
      <FieldSelect
        {...props}
        components={{ Option: ColumnOption }}
        isMulti
        placeholder="Select columns to display"
      />
    </div>
  );
}
