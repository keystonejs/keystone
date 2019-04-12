/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Button } from '@arch-ui/button';
import { KebabHorizontalIcon } from '@arch-ui/icons';
import { colors } from '@arch-ui/theme';
import { OptionPrimitive, CheckMark } from '@arch-ui/options';

import { Popout, POPOUT_GUTTER } from '../../components/Popout';
import { useList, useListColumns } from './dataHooks';
import FieldSelect from './FieldSelect';

type Props = {
  listKey: string,
};

export default function ColumnPopout({ listKey }: Props) {
  const list = useList(listKey);
  const [columns, handleColumnChange] = useListColumns(listKey);
  const cypresId = 'ks-column-select';

  return (
    <Popout
      target={handlers => (
        <Button
          variant="subtle"
          css={{
            background: 0,
            border: 0,
            color: colors.N40,
          }}
          {...handlers}
        >
          <KebabHorizontalIcon />
        </Button>
      )}
      headerTitle="Columns"
    >
      <div id={cypresId} css={{ padding: POPOUT_GUTTER }}>
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
