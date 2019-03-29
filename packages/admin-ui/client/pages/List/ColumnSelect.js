/** @jsx jsx */
import { jsx } from '@emotion/core';
import { OptionPrimitive } from '@arch-ui/options';

import { POPOUT_GUTTER } from '../../components/Popout';
import FieldSelect, { type FieldSelectProps } from './FieldSelect';

export const ColumnOption = ({ children, isFocused, isSelected, selectProps, ...props }) => {
  const { removeIsAllowed } = selectProps;

  return (
    <OptionPrimitive
      isDisabled={!removeIsAllowed}
      isFocused={isFocused}
      isSelected={isSelected}
      {...props}
    >
      <span>{children}</span>
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
        includeLabelField
      />
    </div>
  );
}
