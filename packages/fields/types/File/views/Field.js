import React, { Component } from 'react';

import {
  FieldContainer,
  FieldLabel,
  FieldInput,
} from '@keystonejs/ui/src/primitives/fields';
// TODO: Upload component?
import { Input } from '@keystonejs/ui/src/primitives/forms';

export default class FileField extends Component {
  onChange = event => {
    const { field, onChange } = this.props;
    // TODO: File upload
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
            autocomplete="off"
            autoFocus={autoFocus}
            type="file"
            value={value}
            onChange={this.onChange}
          />
        </FieldInput>
      </FieldContainer>
    );
  }
}
