// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect } from 'react';
import chrono from 'chrono-node';
import { Input } from '@arch-ui/input';
import { format } from 'date-fns';

type Props = {
  date: string | null,
  onChange: (string | null) => mixed,
};

export let TextDayPicker = ({ date, onChange, ...props }: Props) => {
  let [value, setValue] = useState(formatDate(date));

  useEffect(() => {
    setValue(formatDate(date));
  }, [date]);

  return (
    <Input
      value={value}
      placeholder="Enter a date..."
      onBlur={() => {
        let newDate = parseDate(value);
        onChange(newDate);
        setValue(formatDate(newDate));
      }}
      onChange={event => {
        setValue(event.target.value);
      }}
      {...props}
    />
  );
};

function formatDate(date) {
  return date === null ? '' : format(date, 'Do MMMM YYYY');
}

function parseDate(value) {
  let parsedDates = chrono.parse(value);
  if (parsedDates[0] === undefined) {
    return null;
  }
  return format(parsedDates[0].start.date(), 'YYYY-MM-DD');
}
