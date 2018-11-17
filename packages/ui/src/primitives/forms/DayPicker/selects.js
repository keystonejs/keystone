// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import * as React from 'react';
import { setMonth, format } from 'date-fns';
import { memo } from '../../../new-typed-react';
import { months, yearRange } from './utils';

const monthOptions = months.map((month, i) => (
  <option key={i} value={i}>
    {format(setMonth(new Date(), month), 'MMM')}
  </option>
));

type SelectMonthProps = {
  onChange: number => mixed,
  month: number,
};

export const SelectMonth: React.ComponentType<SelectMonthProps> = memo(({ onChange, month }) => {
  return (
    <select
      onChange={event => {
        onChange(Number(event.target.value));
      }}
      value={month}
    >
      {monthOptions}
    </select>
  );
});

export type YearPickerType = 'auto' | 'input';

type SelectYearProps = {
  onChange: number => mixed,
  year: number,
  yearRangeFrom: number,
  yearRangeTo: number,
  yearPickerType: YearPickerType,
};

// todo: add internal state to this component so consumers of the component only get valid years
export const SelectYear: React.ComponentType<SelectYearProps> = memo(
  ({ onChange, year, yearRangeFrom, yearRangeTo, yearPickerType }) => {
    const years = yearRange(yearRangeFrom, yearRangeTo);

    const handleChange = event => {
      const value = Number(event.target.value);
      onChange(value);
    };

    if ((years.length > 50 && yearPickerType === 'auto') || yearPickerType === 'input') {
      return (
        <input
          type="number"
          min={yearRangeFrom}
          max={yearRangeTo}
          onChange={handleChange}
          value={year}
        />
      );
    } else {
      return (
        <select onChange={handleChange} value={year}>
          {years.map((yearOption, i) => (
            <option key={i} value={year}>
              {yearOption}
            </option>
          ))}
        </select>
      );
    }
  }
);
