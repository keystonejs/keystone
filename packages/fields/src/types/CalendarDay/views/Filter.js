import React, { useState } from 'react';
import { format } from 'date-fns';
import { TextDayPicker } from '@arch-ui/day-picker';

const FORMAT = 'YYYY-MM-DD';

const CalendarDayFilterView = ({ onChange, filter }) => {
  const [value, setValue] = useState(format(new Date(), FORMAT));

  const handleSelectedChange = newValue => {
    if (newValue === null) {
      newValue = format(new Date(), FORMAT);
    }

    onChange(newValue);
    setValue(newValue);
  };

  if (!filter) return null;

  return <TextDayPicker date={value} onChange={handleSelectedChange} />;
};

export default CalendarDayFilterView;
