/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Component } from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
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

export default class UrlField extends Component {
  onChange = event => {
    this.props.onChange({
      originalUrl: event.target.value,
    });
  };

  render() {
    const { autoFocus, field, value, savedValue = {}, errors } = this.props;
    const htmlID = `ks-oembed-${field.path}`;
    const canRead = errors.every(
      error => !(error instanceof Error && error.name === 'AccessDeniedError')
    );
    const error = errors.find(
      error => error instanceof Error && error.name === 'AccessDeniedError'
    );
    const hasChanged = field.hasChanged(savedValue.originalUrl, value.originalUrl);

    return (
      <FieldContainer>
        <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
        <FieldInput>
          <Input
            autoComplete="off"
            autoFocus={autoFocus}
            type="url"
            value={canRead && value.originalUrl}
            placeholder={canRead ? undefined : error.message}
            onChange={this.onChange}
            id={htmlID}
          />
        </FieldInput>
        {value.originalUrl && hasChanged && (
          <PlaceholderPreview originalUrl={value.originalUrl} fieldPath={field.path} />
        )}
        {value.originalUrl && !hasChanged && (
          <StyledPreview
            preview={value.preview}
            originalUrl={value.originalUrl}
            fieldPath={field.path}
          />
        )}
      </FieldContainer>
    );
  }
}
