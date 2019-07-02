/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Component } from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { Input } from '@arch-ui/input';

export default class TextField extends Component {
  onChange = event => {
    this.props.onChange(event.target.value);
  };
  render() {
    const { autoFocus, field, errors, value: serverValue } = this.props;
    const { isMultiline } = field.config;
    const value = serverValue || '';
    const htmlID = `ks-input-${field.path}`;
    const canRead = errors.every(
      error => !(error instanceof Error && error.name === 'AccessDeniedError')
    );
    const error = errors.find(
      error => error instanceof Error && error.name === 'AccessDeniedError'
    );

    return (
      <FieldContainer>
        <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
        <FieldInput>
          <Input
            autoComplete="off"
            autoFocus={autoFocus}
            type="text"
            value={canRead ? value : undefined}
            placeholder={canRead ? undefined : error.message}
            onChange={this.onChange}
            id={htmlID}
            isMultiline={isMultiline}
          />
        </FieldInput>
      </FieldContainer>
    );
  }
}
