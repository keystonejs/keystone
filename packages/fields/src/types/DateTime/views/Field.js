/** @jsx jsx */

import { jsx } from '@emotion/core';

import { FieldContainer, FieldLabel, FieldDescription, FieldInput } from '@arch-ui/fields';
import { TextDayTimePicker } from '@arch-ui/day-picker';

const DateTimeField = ({ autoFocus, field, onChange, value, errors }) => {
  const htmlID = `ks-input-${field.path}`;

  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
      <FieldDescription text={field.adminDoc} />
      <FieldInput>
        <TextDayTimePicker id={htmlID} date={value} onChange={onChange} autoFocus={autoFocus} />
      </FieldInput>
    </FieldContainer>
  );
};

export default DateTimeField;
