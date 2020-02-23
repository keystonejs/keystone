import React from 'react';

import {
  FieldContainer,
  FieldLabel,
  FieldDescription,
  FieldInput,
  Currency,
} from '@arch-ui/fields';
import { Input } from '@arch-ui/input';

const TextField = ({ onChange, autoFocus, field, value, errors }) => {
  const handleChange = event => {
    const value = event.target.value;
    onChange(value.replace(/[^0-9.,]+/g, ''));
  };

  const valueToString = value => {
    // Make the value a string to prevent loss of accuracy and precision.
    if (typeof value === 'string') {
      return value;
    } else if (typeof value === 'number') {
      return String(value);
    } else {
      // If it is neither string nor number then it must be empty.
      return '';
    }
  };

  const {
    // currency,
    // digits,
    symbol,
  } = field.config;
  const htmlID = `ks-input-${field.path}`;

  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
      {field.config.adminDoc && <FieldDescription>{field.config.adminDoc}</FieldDescription>}
      <FieldInput>
        {symbol && <Currency>{symbol}</Currency>}
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

export default TextField;
