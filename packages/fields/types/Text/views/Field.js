import React, { Component } from 'react';

import {
  FieldContainer,
  FieldLabel,
  FieldInput,
} from '@keystonejs/ui/src/primitives/fields';
import { Input } from '@keystonejs/ui/src/primitives/forms';

export default class TextField extends Component {
  onChange = event => {
    const { field, onChange } = this.props;
    onChange(field, event.target.value);
  };
  render() {
    const { autoFocus, field, item } = this.props;
    const value = item[field.path] || '';
    const htmlID = `ks-input-${field.path}`;

    return (
      <FieldContainer>
        <FieldLabel htmlFor={htmlID}>{field.label}</FieldLabel>
        <FieldInput>
          <Input
            autoComplete="off"
            autoFocus={autoFocus}
            type="text"
            value={value}
            onChange={this.onChange}
            id={htmlID}
          />
        </FieldInput>
      </FieldContainer>
    );
  }
}
