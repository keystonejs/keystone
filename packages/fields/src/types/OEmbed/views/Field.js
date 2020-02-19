/** @jsx jsx */

import { jsx } from '@emotion/core';

import { FieldContainer, FieldLabel, FieldDescription, FieldInput } from '@arch-ui/fields';
import { Input } from '@arch-ui/input';
import { borderRadius, colors, gridSize } from '@arch-ui/theme';

import Preview from './preview';

const StyledPreview = ({ preview, originalUrl, fieldPath, ...props }) => (
  <Preview
    data={preview}
    originalUrl={originalUrl}
    fieldPath={fieldPath}
    css={{
      backgroundColor: 'white',
      borderRadius,
      border: `1px solid ${colors.N20}`,
      marginTop: gridSize,
      padding: 4,
      width: 410, // 300px image + chrome
      boxSizing: 'border-box',
    }}
    {...props}
  />
);

const PlaceholderPreview = ({ originalUrl, fieldPath }) => (
  <StyledPreview
    data={{
      html: '<div style="background-color: darkgray; height: 2.5em" />',
      title: 'Preview will be generated after save',
    }}
    originalUrl={originalUrl}
    fieldPath={fieldPath}
    css={{
      opacity: 0.3,
    }}
  />
);

const OEmbedField = ({ onChange, autoFocus, field, value = null, savedValue = null, errors }) => {
  const handleChange = event => {
    onChange({
      originalUrl: event.target.value,
    });
  };

  const htmlID = `ks-oembed-${field.path}`;
  const canRead = errors.every(
    error => !(error instanceof Error && error.name === 'AccessDeniedError')
  );
  const error = errors.find(error => error instanceof Error && error.name === 'AccessDeniedError');
  const hasChanged = field.hasChanged({ [field.path]: savedValue }, { [field.path]: value });

  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
      {field.config.adminDoc && <FieldDescription>{field.config.adminDoc}</FieldDescription>}
      <FieldInput>
        <Input
          autoComplete="off"
          autoFocus={autoFocus}
          type="url"
          value={(canRead && value && value.originalUrl) || ''}
          placeholder={canRead ? undefined : error.message}
          onChange={handleChange}
          id={htmlID}
        />
      </FieldInput>
      {value && value.originalUrl && hasChanged && (
        <PlaceholderPreview originalUrl={value.originalUrl} fieldPath={field.path} />
      )}
      {value && value.originalUrl && !hasChanged && (
        <StyledPreview
          preview={value.preview}
          originalUrl={value.originalUrl}
          fieldPath={field.path}
        />
      )}
    </FieldContainer>
  );
};

export default OEmbedField;
