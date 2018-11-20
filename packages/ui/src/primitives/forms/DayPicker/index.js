// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { getYear, setMonth, format, setDay, setYear, addMonths, subMonths } from 'date-fns';
import { VariableSizeList as List } from 'react-window';
import { ChevronLeftIcon, ChevronRightIcon } from '@voussoir/icons';
import { useLayoutEffect, useState, useRef, useMemo, useCallback } from '../../../new-typed-react';
import { borderRadius, colors } from '../../../theme';
import { yearRange, months, type Weeks, getWeeksInMonth } from './utils';
import { type YearPickerType, SelectMonth, SelectYear } from './selects';
import { Month } from './month';
import { WeekLabels, Day } from './comps';

const Wrapper = styled.div({
  fontSize: '0.85rem',
});

const Header = styled.div({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
});

const HeaderButton = props => (
  <button
    type="button"
    css={{
      background: 'none',
      borderRadius: borderRadius,
      border: 'none',
      cursor: 'pointer',
      padding: '0.5rem 0.75rem',
      outline: 'none',

      ':hover': {
        backgroundColor: colors.N05,
      },
      ':active': {
        backgroundColor: colors.N10,
      },
    }}
    {...props}
  />
);

export type { YearPickerType } from './selects';

type DayPickerProps = {
  onSelectedChange: Date => void,
  yearRangeFrom: number,
  yearRangeTo: number,
  yearPickerType: YearPickerType,
  startCurrentDateAt: Date,
  startSelectedDateAt: Date,
};

let DAY_HEIGHT = 32.5;

function scrollToDate(
  date: Date,
  yearRangeFrom: number,
  yearRangeTo: number,
  list: List<*> | null
) {
  if (list !== null) {
    const year = getYear(date);
    const month = date.getMonth();
    // calculate the index instead of using find because this is much cheaper
    const index = (year - yearRangeFrom) * 12 + month;
    list.scrollToItem(index, 'start');
  }
}

let weekLabels = (
  <WeekLabels>
    {[...new Array(7)]
      .map((_, day) => format(setDay(new Date(), day), 'ddd'))
      .map(d => (
        <Day key={d}>{d}</Day>
      ))}
  </WeekLabels>
);

// this component will rerender a lot really quickly
// so there's lots of memoization

export const DayPicker = ({
  yearRangeFrom,
  yearRangeTo,
  yearPickerType,
  startCurrentDateAt,
  startSelectedDateAt,
  onSelectedChange,
}: DayPickerProps) => {
  const listRef = useRef(null);

  const [date, setDate] = useState(startCurrentDateAt);

  const shouldChangeScrollPositionRef = useRef(true);

  const controlledSetDate = useCallback(
    (newDate: Date | (Date => Date)) => {
      shouldChangeScrollPositionRef.current = true;
      setDate(newDate);
    },
    [shouldChangeScrollPositionRef, setDate]
  );

  const [selectedDate, _setSelectedDate] = useState(startSelectedDateAt);
  const setSelectedDate = useCallback(
    (newSelectedDate: Date) => {
      _setSelectedDate(newSelectedDate);
      onSelectedChange(newSelectedDate);
    },
    [_setSelectedDate, onSelectedChange]
  );

  useLayoutEffect(
    () => {
      if (shouldChangeScrollPositionRef.current) {
        scrollToDate(date, yearRangeFrom, yearRangeTo, listRef.current);
        shouldChangeScrollPositionRef.current = false;
      }
    },
    [date, yearRangeFrom, yearRangeTo, listRef]
  );

  const years = useMemo(
    () => {
      return yearRange(yearRangeFrom, yearRangeTo);
    },
    [yearRangeFrom, yearRangeTo]
  );

  const items = useMemo(
    () => {
      const _items: Array<{ year: number, month: number, weeks: Weeks }> = [];

      years.forEach(year => {
        months.forEach(month => {
          _items.push({
            year,
            month,
            weeks: getWeeksInMonth(new Date(year, month, 1)),
          });
        });
      });
      return _items;
    },
    [years]
  );

  return (
    <Wrapper>
      <Header>
        {useMemo(
          () => (
            <HeaderButton
              onClick={() => {
                controlledSetDate(currentDate => subMonths(currentDate, 1));
              }}
            >
              <ChevronLeftIcon />
            </HeaderButton>
          ),
          [controlledSetDate]
        )}
        <SelectMonth
          onChange={useCallback(
            month => {
              controlledSetDate(currentDate => {
                return setMonth(currentDate, month);
              });
            },
            [controlledSetDate]
          )}
          month={date.getMonth()}
        />
        <SelectYear
          year={getYear(date)}
          onChange={useCallback(
            year => {
              controlledSetDate(currentDate => {
                return setYear(currentDate, year);
              });
            },
            [controlledSetDate]
          )}
          yearRangeFrom={yearRangeFrom}
          yearRangeTo={yearRangeTo}
          yearPickerType={yearPickerType}
        />
        {useMemo(
          () => (
            <HeaderButton
              onClick={() => {
                controlledSetDate(addMonths(date, 1));
              }}
            >
              <ChevronRightIcon />
            </HeaderButton>
          ),
          [controlledSetDate]
        )}
      </Header>
      <div>
        {weekLabels}
        <List
          ref={listRef}
          onItemsRendered={useCallback(
            ({ visibleStartIndex }) => {
              const item = items[visibleStartIndex];
              setDate(new Date(item.year, item.month, 1));
            },
            [items]
          )}
          itemSize={useCallback(
            index => {
              const { weeks } = items[index];
              return weeks.length * DAY_HEIGHT + 26.5;
            },
            [items]
          )}
          itemData={useMemo(() => ({ items, selectedDate, setSelectedDate }), [
            items,
            selectedDate,
            setSelectedDate,
          ])}
          height={6 * DAY_HEIGHT + 26.5}
          itemCount={years.length * 12}
          width="100%"
        >
          {Month}
        </List>
      </div>
    </Wrapper>
  );
};

DayPicker.defaultProps = {
  yearRangeFrom: getYear(new Date()) - 100,
  yearRangeTo: getYear(new Date()),
  yearPickerType: 'auto',
};
