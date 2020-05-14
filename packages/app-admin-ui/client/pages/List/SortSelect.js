/** @jsx jsx */

import { jsx } from '@emotion/core';
import { useMemo, useRef } from 'react';
import styled from '@emotion/styled';
import { CheckMark, OptionPrimitive, Options } from '@arch-ui/options';
import { colors } from '@arch-ui/theme';
import { Kbd } from '@arch-ui/typography';
import { Button } from '@arch-ui/button';

import { DisclosureArrow, Popout, POPOUT_GUTTER } from '../../components/Popout';
import { useListSort, useKeyDown } from './dataHooks';
import { useList } from '../../providers/List';

export default function SortPopout() {
  const { list } = useList();
  const [sortValue, handleSortChange] = useListSort();
  const altIsDown = useKeyDown('Alt');
  const popoutRef = useRef();

  const handleChange = field => {
    const isSelected = field.path === sortValue.field.path;

    let direction = 'ASC';
    if (isSelected) {
      direction = invertDirection(sortValue.direction);
    } else if (altIsDown) {
      direction = 'DESC';
    }

    handleSortChange({ field, direction });
    popoutRef.current.close();
  };

  const cachedOptions = useMemo(
    () =>
      list.fields
        .filter(({ isOrderable }) => isOrderable) // TODO: should we include ID fields here?
        .map(({ options, ...field }) => field),
    [list]
  );

  const cypressId = 'list-page-sort-button';

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
        <Button variant="subtle" appearance="primary" spacing="cozy" id={cypressId} {...handlers}>
          {sortValue.field.label}
          <DisclosureArrow />
        </Button>
      )}
    >
      <div css={{ padding: POPOUT_GUTTER }}>
        <Options
          components={{ Option: SortOption }}
          isOptionSelected={isOptionSelected}
          onChange={handleChange}
          options={cachedOptions}
          placeholder="Search fields..."
          value={sortValue}
          altIsDown={altIsDown}
        />
      </div>
    </Popout>
  );
}

// ==============================
// Styled Components
// ==============================

export const SortOption = ({ children, isFocused, isSelected, ...props }) => {
  const { altIsDown } = props.selectProps;
  const direction = isSelected ? '(ASC)' : altIsDown ? '(ASC)' : '(DESC)';

  return (
    <OptionPrimitive isFocused={isFocused} isSelected={isSelected} {...props}>
      <span>
        {children}
        <small css={{ color: colors.N40 }}> {direction}</small>
      </span>
      <CheckMark isFocused={isFocused} isSelected={isSelected} />
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
