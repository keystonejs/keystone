/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, useRef } from 'react';
import styled from '@emotion/styled';
import { ChevronDownIcon, ChevronUpIcon } from '@arch-ui/icons';
import { OptionPrimitive, Options } from '@arch-ui/options';
import { colors } from '@arch-ui/theme';
import { Kbd } from '@arch-ui/typography';

import { DisclosureArrow, Popout, POPOUT_GUTTER } from '../../components/Popout';
import { useList, useListSort, useKeyDown } from './dataHooks';

type Props = {
  listKey: string,
};

export default function SortPopout({ listKey }: Props) {
  const list = useList(listKey);
  const [sortValue, handleSortChange] = useListSort(listKey);
  const altIsDown = useKeyDown('Alt');
  const popoutRef = useRef();

  const handleChange = field => {
    const isSelected = field.path === sortValue.field.path;
    console.log('handleChange', field);

    let direction = 'ASC';
    if (isSelected) {
      direction = invertDirection(sortValue.direction);
    } else if (altIsDown) {
      direction = 'DESC';
    }

    handleSortChange({ field, direction });
    popoutRef.current.close();
  };

  const cachedOptions = useMemo(() => list.fields.map(({ options, ...field }) => field), [list]);

  return (
    <Popout
      innerRef={popoutRef}
      headerTitle="Sort"
      footerContent={
        <Note>
          Hold <Kbd>alt</Kbd> to toggle ascending/descending
        </Note>
      }
      target={handlers => (
        <SortButton {...handlers}>
          {sortValue.field.label.toLowerCase()}
          <DisclosureArrow size="0.2em" />
        </SortButton>
      )}
    >
      <div css={{ padding: POPOUT_GUTTER }}>
        <Options
          components={{ Option: SortOption }}
          isOptionSelected={isOptionSelected}
          onChange={handleChange}
          options={cachedOptions}
          placeholder="Find a field..."
          value={sortValue}
        />
      </div>
    </Popout>
  );
}

// ==============================
// Styled Components
// ==============================

export const SortButton = styled.button(({ isActive }) => {
  const overStyles = {
    color: colors.primary,
    borderBottomColor: colors.primary,
  };
  const activeStyles = isActive ? overStyles : null;
  return {
    background: 0,
    border: 0,
    borderBottom: `1px solid ${colors.N20}`,
    outline: 0,
    color: 'inherit',
    cursor: 'pointer',
    display: 'inline-block',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    marginLeft: '0.5ex',
    padding: 0,
    verticalAlign: 'baseline',

    ':hover, :focus': overStyles,
    ...activeStyles,
  };
});

export const SortOption = ({ children, isFocused, isSelected, ...props }) => {
  const altIsDown = useKeyDown('Alt');
  const Icon = isSelected ? ChevronUpIcon : altIsDown ? ChevronUpIcon : ChevronDownIcon;
  const iconColor = !isFocused && !isSelected ? colors.N40 : 'currentColor';

  return (
    <OptionPrimitive isFocused={isFocused} isSelected={isSelected} {...props}>
      <span>{children}</span>
      <Icon css={{ color: iconColor }} />
    </OptionPrimitive>
  );
};

const Note = styled.div({
  color: colors.N60,
  fontSize: '0.85em',
});

// ==============================
// Utilities
// ==============================

function invertDirection(direction) {
  const inverted = { ASC: 'DESC', DESC: 'ASC' };
  return inverted[direction] || direction;
}
function isOptionSelected(opt, selected) {
  return opt.path === selected[0].field.path;
}
