import React from 'react';

import { FieldContainer, FieldLabel, FieldDescription, FieldInput } from '@arch-ui/fields';
import { Input } from '@arch-ui/input';

const TextField = ({ onChange, autoFocus, field, value, errors }) => {
  const handleChange = event => {
    const value = event.target.value;
    // Similar implementation as per old Keystone version
    if (/^-?\d*\.?\d*$/.test(value)) {
      onChange(value);
    }
  };

  const htmlID = `ks-input-${field.path}`;

  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
      {field.config.adminDoc && <FieldDescription>{field.config.adminDoc}</FieldDescription>}
      <FieldInput>
        <Input
          autoComplete="off"
          autoFocus={autoFocus}
          type="text"
          value={value}
          onChange={handleChange}
          id={htmlID}
        />
      </FieldInput>
    </FieldContainer>
  );
};

export default TextField;
