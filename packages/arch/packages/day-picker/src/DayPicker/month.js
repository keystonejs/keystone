/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import {
  isToday as isDayToday,
  isSameMonth,
  isEqual as areDatesEqual,
  format,
  setMonth,
} from 'date-fns';
import { memo, useRef, useEffect } from 'react';
import { colors } from '@arch-ui/theme';
import { months } from './utils';
import { WeekRow, Day } from './comps';

const TodayMarker = styled.div(({ isSelected }) => ({
  backgroundColor: isSelected ? 'white' : colors.danger,
  borderRadius: 4,
  height: 2,
  marginBottom: -4,
  marginTop: 2,
  width: '1em',
}));

export const Month = memo(({ style, index, data }) => {
  const { items, selectedDate, onSelectedChange, observer } = data;
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (node !== null) {
      observer.observe(node);
      return () => observer.unobserve(node);
    }
  }, [observer]);
  const { weeks, month, year } = items[index];
  return (
    <div ref={ref} data-index={index} id={`ks-month-${month}-${year}`} style={style}>
      <MonthHeader month={month} year={year} />
      {weeks.map((week, i) => (
        <WeekRow key={i}>
          {week.map(day => {
            const date = new Date(year, month, 3);
            const disabled = !isSameMonth(date, day.dateValue);
            const isSelected =
              !disabled && selectedDate !== null && areDatesEqual(selectedDate, day.dateValue);
            const isToday = isDayToday(day.dateValue);
            return (
              <Day
                id={`ks-day-${day.label}-${month}-${year}`}
                key={day.label}
                disabled={disabled}
                onClick={disabled ? null : () => onSelectedChange(day.dateValue)}
                isInteractive={!disabled}
                isSelected={isSelected}
                isToday={isToday}
              >
                {day.label}
                {isToday ? <TodayMarker isSelected={isSelected} /> : null}
              </Day>
            );
          })}
        </WeekRow>
      ))}
    </div>
  );
});

const readableMonths = months.map(month => format(setMonth(new Date(), month), 'LLLL'));

const MonthHeader = memo(({ month, year }) => {
  return (
    <div
      css={{
        position: 'sticky',
        top: 0,
        width: '100%',
        backgroundColor: '#fff',
      }}
    >
      {/*if you're going to change the styles here make sure
     to update the size in the itemSize prop for List in DayPicker */}
      <div
        css={{
          paddingTop: 4,
          paddingBottom: 4,
          border: `1px ${colors.N60} solid`,
          borderLeft: 0,
          borderRight: 0,
          display: 'flex',
          justifyContent: 'space-between',
          paddingRight: 12,
        }}
      >
        <span
          css={{
            color: colors.N60,
          }}
        >
          {readableMonths[month]}
        </span>
        <span
          css={{
            color: colors.N60,
          }}
        >
          {year}
        </span>
      </div>
    </div>
  );
});
