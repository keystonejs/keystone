import React from 'react';

import { FieldContainer, FieldLabel, FieldDescription, FieldInput } from '@arch-ui/fields';
import { Input } from '@arch-ui/input';

const IntegerField = ({ onChange, autoFocus, field, value, errors }) => {
  const handleChange = event => {
    const value = event.target.value;
    onChange(value.replace(/\D/g, ''));
  };

  const valueToString = value => {
    // Make the value a string to keep react happy.
    if (typeof value === 'string') {
      return value;
    } else if (typeof value === 'number') {
      return String(value);
    } else {
      // If it is neither string nor number then it must be empty.
      return '';
    }
  };

  const htmlID = `ks-input-${field.path}`;

  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
      <FieldDescription text={field.adminDoc} />
      <FieldInput>
        <Input
          autoComplete="off"
          autoFocus={autoFocus}
          type="text"
          value={valueToString(value)}
          onChange={handleChange}
          id={htmlID}
        />
      </FieldInput>
    </FieldContainer>
  );
};

export default IntegerField;
