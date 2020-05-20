/** @jsx jsx */

import { jsx } from '@emotion/core';
import { OptionPrimitive, CheckMark } from '@arch-ui/options';

import { Popout, POPOUT_GUTTER } from '../../components/Popout';
import { useListColumns } from './dataHooks';
import { useList } from '../../providers/List';
import FieldSelect from './FieldSelect';

export default function ColumnPopout({ target }) {
  const { list } = useList();
  const [columns, handleColumnChange] = useListColumns();
  const cypresSelectId = 'ks-column-select';

  return (
    <Popout target={target} headerTitle="Columns">
      <div id={cypresSelectId} css={{ padding: POPOUT_GUTTER }}>
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

  return (
    <OptionPrimitive isFocused={isFocused} isSelected={isSelected} {...props}>
      <span>{children}</span>
      <CheckMark
        isDisabled={isSelected && !removeIsAllowed}
        isFocused={isFocused}
        isSelected={isSelected}
      />
    </OptionPrimitive>
  );
};
