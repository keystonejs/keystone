/** @jsx jsx */

import { jsx } from '@emotion/core';
import { FieldContainer, FieldLabel, FieldDescription, FieldInput } from '@arch-ui/fields';
import { Input } from '@arch-ui/input';
import { Alert } from '@arch-ui/alert';
import 'react-day-picker/dist/style.css';
import { DayPicker } from 'react-day-picker';
import { parseISO, compareAsc, formatISO, isValid } from 'date-fns';

const CalendarDayField = ({
  autoFocus,
  field: { format, path, label, isRequired, adminDoc },
  value,
  errors,
  onChange,
  isDisabled,
}) => {
  const htmlID = `ks-daypicker-${path}`;

  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlID} field={{ label, isRequired }} errors={errors} />
      <FieldDescription text={adminDoc} />
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
          date={value}
          format={format}
          onChange={onChange}
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
