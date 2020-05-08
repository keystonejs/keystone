/** @jsx jsx */

import { jsx } from '@emotion/core';

import { FieldContainer, FieldLabel, FieldDescription, FieldInput } from '@arch-ui/fields';

import { CheckboxPrimitive } from '@arch-ui/controls';

const CheckboxField = ({ onChange, autoFocus, field, value, errors }) => {
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
        />
        <FieldLabel
          htmlFor={htmlID}
          field={field}
          errors={errors}
          css={{ padding: '4px', fontSize: '1rem' }}
        />
      </FieldInput>
    </FieldContainer>
  );
};

export default CheckboxField;
