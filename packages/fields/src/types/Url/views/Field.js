/** @jsx jsx */

import { jsx } from '@emotion/core';

import { FieldContainer, FieldLabel, FieldDescription, FieldInput } from '@arch-ui/fields';
import { Input } from '@arch-ui/input';

const UrlField = ({ onChange, autoFocus, field, value = '', errors, isDisabled }) => {
  const handleChange = event => {
    onChange(event.target.value);
  };

  const htmlID = `ks-input-${field.path}`;
  const canRead = errors.every(
    error => !(error instanceof Error && error.name === 'AccessDeniedError')
  );
  const error = errors.find(error => error instanceof Error && error.name === 'AccessDeniedError');

  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
      <FieldDescription text={field.adminDoc} />
      <FieldInput>
        <Input
          autoComplete="off"
          autoFocus={autoFocus}
          required={field.isRequired}
          type="url"
          value={canRead ? value : undefined}
          placeholder={canRead ? undefined : error.message}
          onChange={handleChange}
          id={htmlID}
          disabled={isDisabled}
        />
      </FieldInput>
    </FieldContainer>
  );
};

export default UrlField;
