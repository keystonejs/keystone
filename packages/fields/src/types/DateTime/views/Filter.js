import React from 'react';
import { formatISO } from 'date-fns';
import { DayTimePicker } from '@arch-ui/day-picker';
import { stringifyDate, parseDate } from './utils';

const DateTimeFilterView = props => {
  const parsedDate = props.value ? parseDate(props.value) : parseDate(new Date().toISOString());

  const handleDayChange = day => {
    props.onChange(
      stringifyDate({ ...parsedDate, date: formatISO(day, { representation: 'date' }) })
    );
  };

  const handleTimeChange = event => {
    props.onChange(stringifyDate({ ...parsedDate, time: event.target.value }));
  };

  const handleOffsetChange = offset => {
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

export default DateTimeFilterView;
