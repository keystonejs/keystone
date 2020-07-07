/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import {
  getYear,
  setMonth,
  format,
  setDay,
  setYear,
  addMonths,
  subMonths,
  endOfYear,
} from 'date-fns';
import { VariableSizeList as List } from 'react-window';
import { ChevronLeftIcon, ChevronRightIcon } from '@primer/octicons-react';
import { useLayoutEffect, useState, useRef, useMemo, useCallback } from 'react';
import { borderRadius, colors } from '@arch-ui/theme';
import { yearRange, months, getWeeksInMonth, isNumberInRange } from './utils';
import { SelectMonth, SelectYear } from './selects';
import { A11yText } from '@arch-ui/typography';
import { Month } from './month';
import { WeekLabels, Day } from './comps';
import 'intersection-observer';

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

let DAY_HEIGHT = 32.5;

function scrollToDate(date, yearRangeFrom, yearRangeTo, list) {
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
      .map((_, day) => format(setDay(new Date(), day), 'iii'))
      .map(d => (
        <Day key={d}>{d}</Day>
      ))}
  </WeekLabels>
);

// this component will rerender a lot really quickly
// so there's lots of memoization

export const DayPicker = ({
  yearRangeFrom = getYear(new Date()) - 100,
  yearRangeTo = getYear(new Date()),
  yearPickerType = 'auto',
  startCurrentDateAt,
  selectedDate,
  onSelectedChange,
}) => {
  const listRef = useRef(null);

  if (!isNumberInRange(startCurrentDateAt.getFullYear(), yearRangeFrom, yearRangeTo)) {
    // if startCurrentDateAt is out of the year range then we go to end of
    // the year of yearRangeTo, ideally we'd throw an error for this case
    // and fix all the incorrect values for startCurrentDateAt but that
    // would require a bunch of other changes so it just isn't worth it right now
    // since we're planning to change a lot of this stuff anyway
    let date = new Date();
    date.setFullYear(yearRangeTo);
    startCurrentDateAt = endOfYear(date);
  }

  const [date, setDate] = useState(startCurrentDateAt);

  const shouldChangeScrollPositionRef = useRef(true);

  const controlledSetDate = useCallback(
    newDate => {
      shouldChangeScrollPositionRef.current = true;
      setDate(newDate);
    },
    [shouldChangeScrollPositionRef, setDate]
  );

  useLayoutEffect(() => {
    if (shouldChangeScrollPositionRef.current) {
      scrollToDate(date, yearRangeFrom, yearRangeTo, listRef.current);
      shouldChangeScrollPositionRef.current = false;
    }
  }, [date, yearRangeFrom, yearRangeTo, listRef]);

  const years = useMemo(() => {
    return yearRange(yearRangeFrom, yearRangeTo);
  }, [yearRangeFrom, yearRangeTo]);

  const items = useMemo(() => {
    const _items = [];

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
  }, [years]);
  const currentIndex = (date.getFullYear() - yearRangeFrom) * 12 + date.getMonth();

  const canGoNextMonth = currentIndex < items.length - 1;
  const canGoPreviousMonth = currentIndex > 0;

  const observer = useMemo(() => {
    return new IntersectionObserver(
      entries => {
        const filteredEntries = entries
          .filter(value => value.isIntersecting)
          .sort((a, b) => {
            if (a.intersectionRatio > b.intersectionRatio) {
              return -1;
            }
            return 1;
          });
        if (filteredEntries.length !== 0) {
          let index = Number(filteredEntries[0].target.getAttribute('data-index'));
          let item = items[index];
          setDate(new Date(item.year, item.month, 1));
        }
      },
      { threshold: 0.6 }
    );
  }, [items]);

  return (
    <Wrapper>
      <Header>
        {useMemo(
          () => (
            <HeaderButton
              disabled={!canGoPreviousMonth}
              onClick={() => {
                controlledSetDate(currentDate => subMonths(currentDate, 1));
              }}
            >
              <ChevronLeftIcon />
              <A11yText>Previous Month</A11yText>
            </HeaderButton>
          ),
          [controlledSetDate, canGoPreviousMonth]
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
              disabled={!canGoNextMonth}
              onClick={() => {
                controlledSetDate(currentDate => addMonths(currentDate, 1));
              }}
            >
              <ChevronRightIcon />
              <A11yText>Next Month</A11yText>
            </HeaderButton>
          ),
          [controlledSetDate, canGoNextMonth]
        )}
      </Header>
      <div>
        {weekLabels}
        <List
          ref={listRef}
          itemSize={useCallback(
            index => {
              const { weeks } = items[index];
              return weeks.length * DAY_HEIGHT + 26.5;
            },
            [items]
          )}
          itemData={useMemo(
            () => ({
              items,
              selectedDate,
              onSelectedChange,
              observer,
            }),
            [items, selectedDate, onSelectedChange, observer]
          )}
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
