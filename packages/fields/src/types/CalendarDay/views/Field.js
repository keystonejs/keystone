/** @jsx jsx */

import { jsx } from '@emotion/core';
import { useState } from 'react';
import { FieldContainer, FieldLabel, FieldDescription, FieldInput } from '@arch-ui/fields';
import { TextDayPicker } from '@arch-ui/day-picker';
import { Alert } from '@arch-ui/alert';
import 'react-day-picker/dist/style.css';
import { DayPicker } from 'react-day-picker';

const CalendarDayField = ({ autoFocus, field, value, errors, onChange, isDisabled }) => {
  const htmlID = `ks-daypicker-${field.path}`;

  const [selectedDay, setSelectedDay] = useState();
  const handleDayClick = day => setSelectedDay(day);

  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
      <FieldDescription text={field.adminDoc} />
      <FieldInput>
        <TextDayPicker
          id={htmlID}
          autoFocus={autoFocus}
          date={value}
          format={field.config.format}
          onChange={onChange}
          disabled={isDisabled}
        />
        <DayPicker selected={selectedDay} onDayClick={handleDayClick} />
      </FieldInput>

      {errors.map(({ message, data }) => (
        <Alert appearance="danger" key={message}>
          {message}
          {data ? ` - ${JSON.stringify(data)}` : null}
        </Alert>
      ))}
    </FieldContainer>
  );
};

export default CalendarDayField;
