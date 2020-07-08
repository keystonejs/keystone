/** @jsx jsx */

import { jsx } from '@emotion/core';
import { useCallback, useMemo } from 'react';

import { FieldContainer, FieldLabel, FieldDescription, FieldInput } from '@arch-ui/fields';
import { Input } from '@arch-ui/input';

const isAccessDeniedError = error => error instanceof Error && error.name === 'AccessDeniedError';

const TextField = ({
  onChange,
  autoFocus,
  field,
  errors,
  value = '',
  isDisabled,
  type = 'text',
}) => {
  const { isMultiline } = field.config;
  const htmlID = `ks-input-${field.path}`;
  const canRead = useMemo(() => errors.every(error => !isAccessDeniedError(error)), [errors]);
  const error = useMemo(() => errors.find(isAccessDeniedError), [errors]);

  const handleChange = useCallback(
    event => {
      onChange(event.target.value);
    },
    [onChange]
  );

  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
      <FieldDescription text={field.adminDoc} />
      <FieldInput>
        <Input
          autoComplete="off"
          autoFocus={autoFocus}
          required={field.isRequired}
          type={type}
          value={canRead ? value : undefined}
          placeholder={canRead ? undefined : error.message}
          onChange={handleChange}
          id={htmlID}
          isMultiline={isMultiline}
          disabled={isDisabled}
        />
      </FieldInput>
    </FieldContainer>
  );
};

export default TextField;
