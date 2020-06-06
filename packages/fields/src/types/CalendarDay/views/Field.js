/** @jsx jsx */

import { jsx } from '@emotion/core';
import { FieldContainer, FieldLabel, FieldDescription, FieldInput } from '@arch-ui/fields';
import { Input } from '@arch-ui/input';
import { Alert } from '@arch-ui/alert';
import 'react-day-picker/dist/style.css';
import { DayPicker } from 'react-day-picker';
import { parseISO, compareAsc, formatISO, isValid } from 'date-fns';

const CalendarDayField = ({ autoFocus, field, value, errors, onChange, isDisabled }) => {
  const htmlID = `ks-daypicker-${field.path}`;
  const handleDayClick = day => onChange(formatISO(day, { representation: 'date' }));

  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
      <FieldDescription text={field.adminDoc} />
      <FieldInput>
        <DayPicker
          disabled={[
            day =>
              isDisabled ||
              (field.config.dateTo && compareAsc(day, parseISO(field.config.dateTo)) === 1) ||
              (field.config.dateTo && compareAsc(parseISO(field.config.dateFrom), day) === 1),
          ]}
          selected={isValid(parseISO(value)) ? parseISO(value) : undefined}
          onDayClick={handleDayClick}
        />
      </FieldInput>

      <FieldInput>
        <Input
          id={htmlID}
          autoFocus={autoFocus}
          onKeyDown={e => {
            // There is a strange bug where after interacting with the day picker
            // and then pressing enter on the input the value is changed to the start
            // of the month. I think this is bug with the day picker.
            // The following is a work-around:
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          onChange={e => {
            // Tiny bit of date format normalisation for convenience
            const normalisedValue = e.target.value.replace('/', '-').replace('\\', '-');
            const parsedValue = parseISO(normalisedValue);
            if (normalisedValue.length === 10 && isValid(parsedValue)) {
              handleDayClick(parsedValue);
            } else {
              onChange(normalisedValue);
            }
          }}
          disabled={isDisabled}
          css={{ color: isValid(parseISO(value)) ? undefined : 'darkred' }}
          value={value}
        />
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
