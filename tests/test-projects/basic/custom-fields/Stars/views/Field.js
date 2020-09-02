import React from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import Stars from './Stars';

const StarsField = ({ field, value, errors, onChange }) => {
  const handleChange = newValue => {
    onChange(newValue);
  };

  const { starCount } = field.config;
  const htmlID = `ks-input-${field.path}`;

  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
      <FieldInput>
        <Stars count={starCount} value={value} onChange={handleChange} />
      </FieldInput>
    </FieldContainer>
  );
};

export default StarsField;
