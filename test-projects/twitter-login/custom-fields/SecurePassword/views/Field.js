import React, { Component } from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { Input } from '@arch-ui/input';

export default class PasswordField extends Component {
  onChange = event => {
    this.props.onChange(event.target.value);
  };
  render() {
    const { field, value } = this.props;
    return (
      <FieldContainer>
        <FieldLabel>{'🔐' + field.label}</FieldLabel>
        <FieldInput>
          <Input type="password" value={value} onChange={this.onChange} />
        </FieldInput>
      </FieldContainer>
    );
  }
}
