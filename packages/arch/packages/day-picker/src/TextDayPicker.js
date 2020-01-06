/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import chrono from 'chrono-node';
import { Input } from '@arch-ui/input';
import { format } from 'date-fns';

export const TextDayPicker = ({
  date,
  onChange,
  format: dateDisplayFormat = 'Do MMMM YYYY',
  ...props
}) => {
  const formatDate = newDate => {
    return newDate === null ? '' : format(newDate, dateDisplayFormat);
  };

  const [value, setValue] = useState(formatDate(date));

  return (
    <Input
      value={value}
      placeholder="Enter a date..."
      onBlur={() => {
        const newDate = parseDate(value);
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

function parseDate(value) {
  const parsed = chrono.parseDate(value);
  if (parsed === undefined) {
    return null;
  }
  return format(parsed, 'YYYY-MM-DD');
}
