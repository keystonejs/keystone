/** @jsx jsx */

import { jsx } from '@emotion/core';

import { FieldContainer, FieldLabel, FieldDescription, FieldInput } from '@arch-ui/fields';
import { TextDayPicker } from '@arch-ui/day-picker';
import { Alert } from '@arch-ui/alert';

const CalendarDayField = ({ autoFocus, field, value, errors, onChange }) => {
  const htmlID = `ks-daypicker-${field.path}`;

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
