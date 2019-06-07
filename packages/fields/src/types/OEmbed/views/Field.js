/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Component } from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { Input } from '@arch-ui/input';
import { ShieldIcon } from '@arch-ui/icons';
import { borderRadius, colors, gridSize } from '@arch-ui/theme';

import Preview from './preview';

const StyledPreview = ({ preview, originalUrl, ...props }) => (
  <Preview
    data={preview}
    originalUrl={originalUrl}
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

const PlaceholderPreview = ({ originalUrl }) => (
  <StyledPreview
    data={{
      html: '<div style="background-color: darkgray; height: 2.5em" />',
      title: 'Preview will be generated after save'
    }}
    originalUrl={originalUrl}
    css={{
      opacity: 0.3
    }}
  />
);

export default class UrlField extends Component {
  onChange = event => {
    this.props.onChange({
      originalUrl: event.target.value
    });
  };

  render() {
    const { autoFocus, field, value, savedValue = {}, error } = this.props;
    const htmlID = `ks-input-${field.path}`;
    const canRead = !(error instanceof Error && error.name === 'AccessDeniedError');
    const hasChanged = field.hasChanged(savedValue.originalUrl, value.originalUrl);

    return (
      <FieldContainer>
        <FieldLabel
          htmlFor={htmlID}
          css={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          {field.label}{' '}
          {!canRead ? (
            <ShieldIcon title={error.message} css={{ color: colors.N20, marginRight: '1em' }} />
          ) : null}
        </FieldLabel>
        <FieldInput>
          <Input
            autoComplete="off"
            autoFocus={autoFocus}
            type="url"
            value={canRead && value && value.originalUrl}
            placeholder={canRead ? undefined : error.message}
            onChange={this.onChange}
            id={htmlID}
          />
        </FieldInput>
        {value.originalUrl && hasChanged && (
          <PlaceholderPreview originalUrl={value.originalUrl} />
        )}
        {value.originalUrl && !hasChanged && (
          <StyledPreview
            preview={value.preview}
            originalUrl={value.originalUrl}
          />
        )}
      </FieldContainer>
    );
  }
}
