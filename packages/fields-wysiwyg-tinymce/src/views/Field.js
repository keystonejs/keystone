/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Component } from 'react';

import { FieldContainer, FieldLabel } from '@arch-ui/fields';

import Editor from './Editor';

export default class WysiwygField extends Component {
  onChange = value => {
    if (typeof value === 'string' && value !== this.props.value) {
      this.props.onChange(value);
    }
  };
  render() {
    const { autoFocus, field, errors, value: serverValue } = this.props;
    const value = serverValue || '';
    const htmlID = `ks-input-${field.path}`;
    const accessError = errors.find(
      error => error instanceof Error && error.name === 'AccessDeniedError'
    );

    if (accessError) return null;

    return (
      <FieldContainer>
        <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
        <div css={{ display: 'flex', flex: 1 }}>
          <Editor value={value} onChange={this.onChange} id={htmlID} autoFocus={autoFocus} />
        </div>
      </FieldContainer>
    );
  }
}
