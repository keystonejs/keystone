/** @jsx jsx */
import { jsx } from '@emotion/core';
import { CheckIcon, DashIcon, XIcon } from '@arch-ui/icons';
import { colors } from '@arch-ui/theme';
import { OptionPrimitive } from '@arch-ui/options';

import { Popout, POPOUT_GUTTER } from '../../components/Popout';
import { useList, useListColumns } from './dataHooks';
import FieldSelect from './FieldSelect';

type Props = {
  listKey: string,
};

export default function ColumnPopout({ listKey }: Props) {
  const list = useList(listKey);
  const [columns, handleColumnChange] = useListColumns(listKey);
  return (
    <Popout buttonLabel="Columns" headerTitle="Columns">
      <div css={{ padding: POPOUT_GUTTER }}>
        <FieldSelect
          fields={list.fields}
          onChange={handleColumnChange}
          removeIsAllowed={columns.length > 1}
          value={columns}
          components={{ Option: ColumnOption }}
          isMulti
          placeholder="Select columns to display"
          includeLabelField
        />
      </div>
    </Popout>
  );
}

// ==============================
// Styled Components
// ==============================

export const ColumnOption = ({ children, isFocused, isSelected, selectProps, ...props }) => {
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
      {isSelected && !removeIsAllowed ? null : <Icon css={{ color: iconColor }} />}
    </OptionPrimitive>
  );
};
