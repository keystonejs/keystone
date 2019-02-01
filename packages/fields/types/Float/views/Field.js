import React, { Component } from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { Input } from '@arch-ui/input';

export default class TextField extends Component {
  onChange = event => {
    const { field, onChange } = this.props;
    const value = event.target.value;
    // Similar implementation as per old Keystone version
    if (/^-?\d*\.?\d*$/.test(value)) {
      onChange(field, value);
    }
  };

  render() {
    const { autoFocus, field, value } = this.props;
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
