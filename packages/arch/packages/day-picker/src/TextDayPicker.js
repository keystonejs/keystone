/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import chrono from 'chrono-node';
import { Input } from '@arch-ui/input';
import { format } from 'date-fns';

export const TextDayPicker = ({
  date,
  onChange,
  format: displayFormat = 'Do MMMM YYYY',
  ...props
}) => {
  const formatDate = newDate => (newDate === null ? '' : format(newDate, displayFormat));

  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState({
    raw: date,
    formatted: formatDate(date),
  });

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const onBlur = () => {
    toggleEditing();

    const newDate = parseDate(value.raw);
    onChange(newDate);

    setValue({
      raw: newDate,
      formatted: formatDate(newDate),
    });
  };

  const handleChange = ({ target: { value: raw } }) => {
    setValue(oldValue => ({ ...oldValue, raw }));
  };

  return (
    <Input
      value={isEditing ? value.raw : value.formatted}
      placeholder="Enter a date..."
      onFocus={toggleEditing}
      onBlur={onBlur}
      onChange={handleChange}
      {...props}
    />
  );
};

function parseDate(value) {
  const parsed = chrono.parseDate(value);
  return parsed === undefined ? null : format(parsed, 'YYYY-MM-DD');
}
