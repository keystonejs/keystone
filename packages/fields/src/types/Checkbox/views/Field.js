/** @jsx jsx */

import { jsx } from '@emotion/core';

import { FieldContainer, FieldLabel, FieldDescription, FieldInput } from '@arch-ui/fields';

import { CheckboxPrimitive } from '@arch-ui/controls';

const CheckboxField = ({ onChange, autoFocus, field, value, errors, isDisabled }) => {
  const handleChange = event => {
    onChange(event.target.checked);
  };

  const checked = value || false;
  const htmlID = `ks-input-${field.path}`;

  return (
    <FieldContainer>
      <FieldDescription text={field.adminDoc} />
      <FieldInput css={{ height: 35, alignItems: 'center' }}>
        <CheckboxPrimitive
          autoFocus={autoFocus}
          checked={checked}
          onChange={handleChange}
          id={htmlID}
          isDisabled={isDisabled}
        />
        <FieldLabel
          htmlFor={htmlID}
          field={field}
          errors={errors}
          css={{ padding: '4px', fontSize: '1rem', width: '100%' }}
        />
      </FieldInput>
    </FieldContainer>
  );
};

export default CheckboxField;
