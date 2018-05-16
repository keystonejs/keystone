import React, { Component } from 'react';

import {
  FieldContainer,
  FieldLabel,
  FieldInput,
} from '@keystonejs/ui/src/primitives/fields';
import { Input } from '@keystonejs/ui/src/primitives/forms';

export default class PasswordField extends Component {
  onChange = event => {
    const { field, onChange } = this.props;
    onChange(field, event.target.value);
  };
  render() {
    const { autoFocus, field, item } = this.props;
    const value = item[field.path] || '';
    return (
      <FieldContainer>
        <FieldLabel>{field.label}</FieldLabel>
        <FieldInput>
          <Input
            autoComplete="off"
            autoFocus={autoFocus}
            type="password"
            value={value}
            onChange={this.onChange}
          />
        </FieldInput>
      </FieldContainer>
    );
  }
}
