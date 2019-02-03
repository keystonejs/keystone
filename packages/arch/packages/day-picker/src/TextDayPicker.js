// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect } from 'react';
import chrono from 'chrono-node';
import { Input } from '@arch-ui/input';
import { format } from 'date-fns';

function formatDate(date) {
  return format(date, 'dddd Do MMMM YYYY');
}

type Props = {
  date: Date | null,
  onChange: (Date | null) => mixed,
};

export let TextDayPicker = ({ date, onChange, ...props }: Props) => {
  let [value, setValue] = useState('');
  useEffect(
    () => {
      if (date === null) {
        setValue('');
      } else {
        setValue(formatDate(date));
      }
    },
    [date]
  );
  return (
    <Input
      value={value}
      placeholder="Enter a date..."
      onBlur={() => {
        let parsedDates = chrono.parse(value);
        if (parsedDates[0] === undefined) {
          onChange(null);
          return;
        }
        onChange(parsedDates[0].start.date());
      }}
      onChange={event => {
        setValue(event.target.value);
      }}
      {...props}
    />
  );
};
