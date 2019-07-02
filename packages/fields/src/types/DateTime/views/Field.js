// @flow
/** @jsx jsx */

import { jsx } from '@emotion/core';

import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { TextDayTimePicker } from '@arch-ui/day-picker';

type Props = {
  onChange: (value: string | null) => mixed,
  autoFocus: boolean,
  field: Object,
  value: string,
  errors: Array<Error>,
};

const DateTimeField = ({ autoFocus, field, onChange, value, errors }: Props) => {
  const htmlID = `ks-input-${field.path}`;

  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
      <FieldInput>
        <TextDayTimePicker id={htmlID} date={value} onChange={onChange} autoFocus={autoFocus} />
      </FieldInput>
    </FieldContainer>
  );
};

export default DateTimeField;
