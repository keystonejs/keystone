/** @jsx jsx */

import { jsx } from '@emotion/core';

import { FieldContainer, FieldLabel, FieldDescription, FieldInput } from '@arch-ui/fields';
import Select from '@arch-ui/select';

const SelectField = ({
  onChange,
  autoFocus,
  field,
  value: serverValue,
  renderContext,
  errors,
  isDisabled,
}) => {
  const handleChange = option => {
    onChange(option ? option.value : null);
  };

  const value = field.options.find(i => i.value === serverValue);
  const htmlID = `ks-input-${field.path}`;
  const canRead = errors.every(
    error => !(error instanceof Error && error.name === 'AccessDeniedError')
  );
  const error = errors.find(error => error instanceof Error && error.name === 'AccessDeniedError');

  const selectProps =
    renderContext === 'dialog'
      ? {
          menuPortalTarget: document.body,
          menuShouldBlockScroll: true,
        }
      : null;

  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
      <FieldDescription text={field.adminDoc} />
      <FieldInput>
        <div css={{ flex: 1 }}>
          <Select
            autoFocus={autoFocus}
            value={canRead ? value : undefined}
            placeholder={canRead ? undefined : error.message}
            options={field.options}
            onChange={handleChange}
            isClearable
            id={`react-select-${htmlID}`}
            inputId={htmlID}
            instanceId={htmlID}
            isDisabled={isDisabled}
            {...selectProps}
          />
        </div>
      </FieldInput>
    </FieldContainer>
  );
};

export default SelectField;
