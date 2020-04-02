import React from 'react';
import { format } from 'date-fns';
import { DayTimePicker } from '@arch-ui/day-picker';
import { stringifyDate, parseDate } from './utils';

const CalendarDayFilterView = props => {
  const parsedDate = props.value ? parseDate(props.value) : parseDate(new Date().toISOString());

  let handleDayChange = day => {
    props.onChange(stringifyDate({ ...parsedDate, date: format(day, 'YYYY-MM-DD') }));
  };

  let handleTimeChange = event => {
    props.onChange(stringifyDate({ ...parsedDate, time: event.target.value }));
  };

  let handleOffsetChange = offset => {
    props.onChange(stringifyDate({ ...parsedDate, offset }));
  };

  if (!props.filter) return null;

  const { yearRangeFrom, yearRangeTo, yearPickerType } = props.field.config;

  return (
    <DayTimePicker
      {...{
        ...parsedDate,
        htmlID: 'calendar-day-filter',
        handleDayChange,
        handleTimeChange,
        handleOffsetChange,
        yearRangeFrom,
        yearRangeTo,
        yearPickerType,
      }}
    />
  );
};

export default CalendarDayFilterView;
