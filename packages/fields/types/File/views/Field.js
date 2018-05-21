import React, { Component } from 'react';

import {
  FieldContainer,
  FieldLabel,
  FieldInput,
} from '@keystonejs/ui/src/primitives/fields';
// TODO: Upload component?
import { Input } from '@keystonejs/ui/src/primitives/forms';

export default class FileField extends Component {
  onChange = ({ target: { validity, files: [file] } }) => {
    const { field, onChange } = this.props;
    if (!validity.valid) {
      // TODO - show error state
      return;
    }
    onChange(field, file);
  };
  render() {
    const { autoFocus, field, item: { avatar } } = this.props;
    return (
      <FieldContainer>
        <FieldLabel>{field.label}</FieldLabel>
        <FieldInput>
          <Input
            autocomplete="off"
            autoFocus={autoFocus}
            type="file"
            onChange={this.onChange}
          />
        </FieldInput>
        {avatar ? <img src={avatar.publicUrl} /> : null}
      </FieldContainer>
    );
  }
}
