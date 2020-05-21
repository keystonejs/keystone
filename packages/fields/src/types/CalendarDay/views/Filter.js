import React from 'react';
import { TextDayPicker } from '@arch-ui/day-picker';

const CalendarDayFilterView = ({ onChange, filter, value, innerRef }) => {
  const handleChange = newValue => {
    if (newValue === null) {
      newValue = '';
    }

    onChange(newValue);
  };

  if (!filter) return null;

  return <TextDayPicker ref={innerRef} date={value} onChange={handleChange} />;
};

export default CalendarDayFilterView;
