// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import * as React from 'react';
import styled from '@emotion/styled';
import {
  isToday as isDayToday,
  isSameMonth,
  isEqual as areDatesEqual,
  format,
  setMonth,
} from 'date-fns';
import { memo } from '../../../new-typed-react';
import { colors } from '../../../theme';
import { months, type Weeks } from './utils';
import { WeekRow, Day } from './comps';

type Props = {
  style: Object,
  index: number,
  data: {
    setSelectedDate: Date => void,
    selectedDate: Date,
    items: Array<{
      weeks: Weeks,
      month: number,
      year: number,
    }>,
  },
};

const TodayMarker = styled.div(({ isSelected }) => ({
  backgroundColor: isSelected ? 'white' : colors.danger,
  borderRadius: 4,
  height: 2,
  marginBottom: -4,
  marginTop: 2,
  width: '1em',
}));

export const Month: React.ComponentType<Props> = memo(({ style, index, data }) => {
  const { items, selectedDate, setSelectedDate } = data;
  const { weeks, month, year } = items[index];
  return (
    <div css={{ scrollSnapAlign: 'start' }} style={style}>
      <MonthHeader month={month} year={year} />
      {weeks.map((week, i) => (
        <WeekRow key={i}>
          {week.map(day => {
            const date = new Date(year, month, 3);
            const disabled = !isSameMonth(date, day.dateValue);
            const isSelected = !disabled && areDatesEqual(selectedDate, day.dateValue);
            const isToday = isDayToday(day.dateValue);
            return (
              <Day
                key={day.label}
                disabled={disabled}
                onClick={disabled ? null : () => setSelectedDate(day.dateValue)}
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

let readableMonths = months.map(month => format(setMonth(new Date(), month), 'MMMM'));

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
