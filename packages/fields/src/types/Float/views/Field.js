import React, { Component } from 'react';

import { FieldContainer, FieldLabel, FieldDescription, FieldInput } from '@arch-ui/fields';
import { Input } from '@arch-ui/input';

export default class TextField extends Component {
  onChange = event => {
    const value = event.target.value;
    // Similar implementation as per old Keystone version
    if (/^-?\d*\.?\d*$/.test(value)) {
      this.props.onChange(value);
    }
  };

  render() {
    const { autoFocus, field, value, errors } = this.props;
    const htmlID = `ks-input-${field.path}`;

    return (
      <FieldContainer>
        <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
        {field.config.adminDoc && <FieldDescription>{field.config.adminDoc}</FieldDescription>}
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
